import { useState, useRef, useCallback, useEffect } from 'react';
import {
  calculateRMS,
  calculateZeroCrossingRate,
  detectPitch,
  isSpeech,
  analyzeBreathing,
  analyzeVoiceStress,
  AudioFeatures,
  VoiceStressResult,
} from '@/lib/voiceStressAnalysis';
import { VoiceMetrics } from '@/lib/stressDetection';

interface UseVoiceStressDetectorOptions {
  onStressUpdate?: (result: VoiceStressResult) => void;
  onMetricsUpdate?: (metrics: VoiceMetrics) => void;
  analysisInterval?: number; // ms between analyses
  smoothingFactor?: number; // 0-1, higher = more smoothing
}

interface UseVoiceStressDetectorReturn {
  isAnalyzing: boolean;
  startAnalysis: (stream: MediaStream) => void;
  stopAnalysis: () => void;
  currentResult: VoiceStressResult | null;
  averageStressScore: number;
  calibrateBaseline: () => void;
}

const DEFAULT_RESULT: VoiceStressResult = {
  metrics: {
    speed: 'normal',
    volume: 'normal',
    pitch: 'normal',
    breathing: 'normal',
    pauses: 'normal',
  },
  features: {
    pitch: 0,
    pitchVariation: 0,
    volume: 0,
    volumeVariation: 0,
    speechRate: 0,
    pauseRatio: 0,
    energy: 0,
    zeroCrossingRate: 0,
  },
  stressScore: 0,
  isBreathingRapid: false,
  isSpeechFast: false,
  isPitchElevated: false,
  isVolumeErratic: false,
};

export function useVoiceStressDetector(
  options: UseVoiceStressDetectorOptions = {}
): UseVoiceStressDetectorReturn {
  const {
    onStressUpdate,
    onMetricsUpdate,
    analysisInterval = 500,
    smoothingFactor = 0.3,
  } = options;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<VoiceStressResult | null>(null);
  const [averageStressScore, setAverageStressScore] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // History for analysis
  const pitchHistoryRef = useRef<number[]>([]);
  const volumeHistoryRef = useRef<number[]>([]);
  const speechSegmentsRef = useRef<{ isSpeech: boolean; duration: number; timestamp: number }[]>([]);
  const stressHistoryRef = useRef<number[]>([]);
  const baselineRef = useRef<{ pitch: number; volume: number } | null>(null);
  const lastSpeechStateRef = useRef<boolean>(false);
  const lastSpeechTimeRef = useRef<number>(Date.now());

  // Cleanup function
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (analyzerRef.current) {
      analyzerRef.current.disconnect();
      analyzerRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  // Stop analysis
  const stopAnalysis = useCallback(() => {
    cleanup();
    setIsAnalyzing(false);
  }, [cleanup]);

  // Analyze audio frame
  const analyzeFrame = useCallback(() => {
    if (!analyzerRef.current) return;

    const analyzer = analyzerRef.current;
    const bufferLength = analyzer.fftSize;
    const buffer = new Float32Array(bufferLength);
    analyzer.getFloatTimeDomainData(buffer);

    const now = Date.now();
    const sampleRate = audioContextRef.current?.sampleRate || 44100;

    // Calculate features
    const rms = calculateRMS(buffer);
    const pitch = detectPitch(buffer, sampleRate);
    const zcr = calculateZeroCrossingRate(buffer);
    const speaking = isSpeech(buffer, 0.015);

    // Track speech segments for breathing analysis
    if (speaking !== lastSpeechStateRef.current) {
      const duration = (now - lastSpeechTimeRef.current) / 1000;
      speechSegmentsRef.current.push({
        isSpeech: lastSpeechStateRef.current,
        duration,
        timestamp: now,
      });
      // Keep last 20 segments
      if (speechSegmentsRef.current.length > 20) {
        speechSegmentsRef.current = speechSegmentsRef.current.slice(-20);
      }
      lastSpeechStateRef.current = speaking;
      lastSpeechTimeRef.current = now;
    }

    // Update history
    if (pitch > 0) {
      pitchHistoryRef.current.push(pitch);
      if (pitchHistoryRef.current.length > 30) {
        pitchHistoryRef.current = pitchHistoryRef.current.slice(-30);
      }
    }

    volumeHistoryRef.current.push(rms);
    if (volumeHistoryRef.current.length > 30) {
      volumeHistoryRef.current = volumeHistoryRef.current.slice(-30);
    }

    // Calculate aggregated features
    const pitchHistory = pitchHistoryRef.current;
    const volumeHistory = volumeHistoryRef.current;

    const avgPitch = pitchHistory.length > 0
      ? pitchHistory.reduce((a, b) => a + b, 0) / pitchHistory.length
      : 0;
    const avgVolume = volumeHistory.reduce((a, b) => a + b, 0) / volumeHistory.length;

    // Calculate variations (standard deviation)
    const pitchVariation = pitchHistory.length > 1
      ? Math.sqrt(pitchHistory.reduce((sum, p) => sum + Math.pow(p - avgPitch, 2), 0) / pitchHistory.length)
      : 0;
    const volumeVariation = volumeHistory.length > 1
      ? Math.sqrt(volumeHistory.reduce((sum, v) => sum + Math.pow(v - avgVolume, 2), 0) / volumeHistory.length)
      : 0;

    // Estimate speech rate from segment data
    const recentSegments = speechSegmentsRef.current.filter(s => now - s.timestamp < 10000);
    const speechTime = recentSegments.filter(s => s.isSpeech).reduce((sum, s) => sum + s.duration, 0);
    const totalTime = recentSegments.reduce((sum, s) => sum + s.duration, 0);
    const pauseRatio = totalTime > 0 ? 1 - (speechTime / totalTime) : 0.3;
    
    // Rough syllable estimate: ~4 syllables per second of speech at normal rate
    const speechRate = speechTime > 0 ? (speechTime * 4) / Math.max(speechTime, 1) : 4;

    // Analyze breathing pattern
    const breathingPattern = analyzeBreathing(speechSegmentsRef.current);

    const features: AudioFeatures = {
      pitch: avgPitch,
      pitchVariation,
      volume: avgVolume,
      volumeVariation,
      speechRate: Math.min(speechRate * (1 / pauseRatio), 10), // Adjust for pause ratio
      pauseRatio,
      energy: rms,
      zeroCrossingRate: zcr,
    };

    // Use baseline if calibrated
    const baseline = baselineRef.current 
      ? { pitch: baselineRef.current.pitch, volume: baselineRef.current.volume }
      : undefined;

    const result = analyzeVoiceStress(features, breathingPattern, baseline);

    // Smooth the stress score
    const smoothedScore = currentResult
      ? currentResult.stressScore * smoothingFactor + result.stressScore * (1 - smoothingFactor)
      : result.stressScore;

    const finalResult = { ...result, stressScore: Math.round(smoothedScore) };

    // Update stress history
    stressHistoryRef.current.push(finalResult.stressScore);
    if (stressHistoryRef.current.length > 20) {
      stressHistoryRef.current = stressHistoryRef.current.slice(-20);
    }

    const avgStress = stressHistoryRef.current.reduce((a, b) => a + b, 0) / stressHistoryRef.current.length;

    setCurrentResult(finalResult);
    setAverageStressScore(Math.round(avgStress));

    onStressUpdate?.(finalResult);
    onMetricsUpdate?.(finalResult.metrics);
  }, [currentResult, onStressUpdate, onMetricsUpdate, smoothingFactor]);

  // Start analysis
  const startAnalysis = useCallback((stream: MediaStream) => {
    // Don't restart if already analyzing with the same stream
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      return;
    }
    
    cleanup();

    try {
      // Clone the stream to avoid interfering with other uses
      const audioContext = new AudioContext({ sampleRate: 44100 });
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 2048;
      analyzer.smoothingTimeConstant = 0.8;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyzer);
      // Don't connect to destination to avoid feedback

      audioContextRef.current = audioContext;
      analyzerRef.current = analyzer;
      sourceRef.current = source;

      // Reset history
      pitchHistoryRef.current = [];
      volumeHistoryRef.current = [];
      speechSegmentsRef.current = [];
      stressHistoryRef.current = [];
      lastSpeechStateRef.current = false;
      lastSpeechTimeRef.current = Date.now();

      // Start analysis loop with longer interval to reduce CPU usage
      intervalRef.current = setInterval(analyzeFrame, analysisInterval);

      setIsAnalyzing(true);
      setCurrentResult(DEFAULT_RESULT);

      console.log('[Voice Stress] Analysis started');
    } catch (error) {
      console.error('[Voice Stress] Failed to start analysis:', error);
      cleanup();
    }
  }, [cleanup, analyzeFrame, analysisInterval]);

  // Calibrate baseline from current state
  const calibrateBaseline = useCallback(() => {
    if (pitchHistoryRef.current.length > 5 && volumeHistoryRef.current.length > 5) {
      const avgPitch = pitchHistoryRef.current.reduce((a, b) => a + b, 0) / pitchHistoryRef.current.length;
      const avgVolume = volumeHistoryRef.current.reduce((a, b) => a + b, 0) / volumeHistoryRef.current.length;
      
      baselineRef.current = {
        pitch: avgPitch || 150,
        volume: avgVolume || 0.3,
      };
      
      console.log('Voice baseline calibrated:', baselineRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    isAnalyzing,
    startAnalysis,
    stopAnalysis,
    currentResult,
    averageStressScore,
    calibrateBaseline,
  };
}
