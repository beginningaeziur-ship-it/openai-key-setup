import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { useMicrophone } from '@/contexts/MicrophoneContext';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Activity,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface VoiceBaseline {
  pitch: number;
  volume: number;
  timestamp: number;
}

export function VoiceCalibration() {
  const { isMicEnabled, audioStream, enableMicrophone, hasPermission } = useMicrophone();
  
  const [sensitivity, setSensitivity] = useState(() => {
    const saved = localStorage.getItem('sai_mic_sensitivity');
    return saved ? parseFloat(saved) : 0.5;
  });
  
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [currentVolume, setCurrentVolume] = useState(0);
  const [baseline, setBaseline] = useState<VoiceBaseline | null>(() => {
    const saved = localStorage.getItem('sai_voice_baseline');
    return saved ? JSON.parse(saved) : null;
  });
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const calibrationDataRef = useRef<{ pitch: number[]; volume: number[] }>({ pitch: [], volume: [] });

  // Save sensitivity changes
  useEffect(() => {
    localStorage.setItem('sai_mic_sensitivity', sensitivity.toString());
  }, [sensitivity]);

  // Set up audio analyzer for real-time monitoring
  useEffect(() => {
    if (!audioStream || !isMicEnabled) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setCurrentVolume(0);
      return;
    }

    try {
      const audioContext = new AudioContext();
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      analyzer.smoothingTimeConstant = 0.8;

      const source = audioContext.createMediaStreamSource(audioStream);
      source.connect(analyzer);

      audioContextRef.current = audioContext;
      analyzerRef.current = analyzer;

      const updateVolume = () => {
        if (!analyzerRef.current) return;
        
        const dataArray = new Float32Array(analyzerRef.current.fftSize);
        analyzerRef.current.getFloatTimeDomainData(dataArray);
        
        // Calculate RMS volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);
        
        // Apply sensitivity and normalize to 0-100
        const adjustedVolume = Math.min(100, rms * sensitivity * 500);
        setCurrentVolume(adjustedVolume);
        
        animationRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.error('Failed to set up audio analyzer:', err);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioStream, isMicEnabled, sensitivity]);

  const startCalibration = async () => {
    if (!isMicEnabled) {
      const enabled = await enableMicrophone();
      if (!enabled) return;
    }

    setIsCalibrating(true);
    setCalibrationProgress(0);
    calibrationDataRef.current = { pitch: [], volume: [] };

    toast.info('Speak normally for 5 seconds to calibrate your voice baseline');

    const startTime = Date.now();
    const duration = 5000; // 5 seconds

    const collectData = () => {
      if (!analyzerRef.current) return;

      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setCalibrationProgress(progress);

      if (elapsed >= duration) {
        finishCalibration();
        return;
      }

      // Collect volume data
      const dataArray = new Float32Array(analyzerRef.current.fftSize);
      analyzerRef.current.getFloatTimeDomainData(dataArray);
      
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length);
      
      if (rms > 0.01) { // Only collect when speaking
        calibrationDataRef.current.volume.push(rms);
        
        // Simple pitch detection via zero-crossing
        let zeroCrossings = 0;
        for (let i = 1; i < dataArray.length; i++) {
          if ((dataArray[i] >= 0 && dataArray[i-1] < 0) || 
              (dataArray[i] < 0 && dataArray[i-1] >= 0)) {
            zeroCrossings++;
          }
        }
        const estimatedPitch = (zeroCrossings / 2) * (44100 / dataArray.length);
        if (estimatedPitch > 50 && estimatedPitch < 500) {
          calibrationDataRef.current.pitch.push(estimatedPitch);
        }
      }

      requestAnimationFrame(collectData);
    };

    collectData();
  };

  const finishCalibration = () => {
    const { pitch, volume } = calibrationDataRef.current;
    
    if (volume.length < 10) {
      toast.error('Not enough speech detected. Please try again and speak clearly.');
      setIsCalibrating(false);
      setCalibrationProgress(0);
      return;
    }

    const avgPitch = pitch.length > 0 
      ? pitch.reduce((a, b) => a + b, 0) / pitch.length 
      : 150;
    const avgVolume = volume.reduce((a, b) => a + b, 0) / volume.length;

    const newBaseline: VoiceBaseline = {
      pitch: Math.round(avgPitch),
      volume: Math.round(avgVolume * 1000) / 1000,
      timestamp: Date.now(),
    };

    setBaseline(newBaseline);
    localStorage.setItem('sai_voice_baseline', JSON.stringify(newBaseline));
    
    setIsCalibrating(false);
    setCalibrationProgress(0);
    
    toast.success('Voice baseline calibrated successfully!');
  };

  const clearBaseline = () => {
    setBaseline(null);
    localStorage.removeItem('sai_voice_baseline');
    toast.info('Voice baseline cleared');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Voice Calibration
        </CardTitle>
        <CardDescription>
          Calibrate your voice baseline for more accurate stress detection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Microphone Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            {isMicEnabled ? (
              <Mic className="w-5 h-5 text-primary" />
            ) : (
              <MicOff className="w-5 h-5 text-muted-foreground" />
            )}
            <span className="text-sm">
              {isMicEnabled ? 'Microphone active' : 'Microphone disabled'}
            </span>
          </div>
          {!isMicEnabled && (
            <Button variant="outline" size="sm" onClick={enableMicrophone}>
              Enable
            </Button>
          )}
        </div>

        {/* Real-time Volume Meter */}
        {isMicEnabled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Input Level
              </span>
              <span className="text-muted-foreground">{Math.round(currentVolume)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-75"
                style={{ width: `${currentVolume}%` }}
              />
            </div>
          </div>
        )}

        {/* Sensitivity Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Microphone Sensitivity</span>
            <span className="text-muted-foreground">{Math.round(sensitivity * 100)}%</span>
          </div>
          <Slider
            value={[sensitivity]}
            onValueChange={([value]) => setSensitivity(value)}
            min={0.1}
            max={1}
            step={0.05}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Adjust sensitivity if your voice is too quiet or too loud
          </p>
        </div>

        {/* Baseline Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Voice Baseline</span>
            {baseline ? (
              <span className="flex items-center gap-1 text-xs text-primary">
                <CheckCircle className="w-3 h-3" />
                Calibrated
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <AlertCircle className="w-3 h-3" />
                Not set
              </span>
            )}
          </div>
          
          {baseline && (
            <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg. Pitch</span>
                <span>{baseline.pitch} Hz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg. Volume</span>
                <span>{(baseline.volume * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Calibrated</span>
                <span>{formatDate(baseline.timestamp)}</span>
              </div>
            </div>
          )}

          {isCalibrating && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
                Listening... speak normally
              </div>
              <Progress value={calibrationProgress} className="h-2" />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={startCalibration}
              disabled={isCalibrating}
              className="flex-1"
            >
              {isCalibrating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calibrating...
                </>
              ) : baseline ? (
                'Recalibrate'
              ) : (
                'Calibrate Now'
              )}
            </Button>
            {baseline && !isCalibrating && (
              <Button variant="outline" onClick={clearBaseline}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
