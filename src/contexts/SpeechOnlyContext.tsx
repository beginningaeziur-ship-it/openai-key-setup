// Speech-Only Mode Context - Voice-first interaction with waveform
import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { useMicrophone } from './MicrophoneContext';
import { useVoiceSettings } from './VoiceSettingsContext';

interface SpeechOnlyContextType {
  // Mode state
  speechOnlyMode: boolean;
  setSpeechOnlyMode: (enabled: boolean) => void;
  
  // Waveform data for visualization
  audioLevel: number;
  waveformData: number[];
  
  // Recording state
  isListening: boolean;
  
  // Start/stop methods
  startListening: () => void;
  stopListening: () => void;
}

const STORAGE_KEY = 'sai_speech_only_mode';

const SpeechOnlyContext = createContext<SpeechOnlyContextType | undefined>(undefined);

export function SpeechOnlyProvider({ children }: { children: ReactNode }) {
  const { isMicEnabled } = useMicrophone();
  const { voiceEnabled } = useVoiceSettings();
  
  const [speechOnlyMode, setSpeechOnlyModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  
  const [audioLevel, setAudioLevel] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>(new Array(32).fill(0));
  const [isListening, setIsListening] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Persist mode
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(speechOnlyMode));
  }, [speechOnlyMode]);

  const setSpeechOnlyMode = useCallback((enabled: boolean) => {
    setSpeechOnlyModeState(enabled);
  }, []);

  // Cleanup audio analysis
  const cleanupAudio = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
    setWaveformData(new Array(32).fill(0));
  }, []);

  // Start audio analysis for waveform
  const startAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true 
        } 
      });
      
      streamRef.current = stream;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateWaveform = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average level
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(avg / 255);
        
        // Update waveform bars
        const bars = Array.from(dataArray).map(v => v / 255);
        setWaveformData(bars);
        
        animationRef.current = requestAnimationFrame(updateWaveform);
      };
      
      updateWaveform();
    } catch (error) {
      console.error('[SpeechOnly] Audio analysis error:', error);
    }
  }, []);

  const startListening = useCallback(() => {
    setIsListening(true);
    startAudioAnalysis();
  }, [startAudioAnalysis]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    cleanupAudio();
  }, [cleanupAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  return (
    <SpeechOnlyContext.Provider value={{
      speechOnlyMode,
      setSpeechOnlyMode,
      audioLevel,
      waveformData,
      isListening,
      startListening,
      stopListening,
    }}>
      {children}
    </SpeechOnlyContext.Provider>
  );
}

export function useSpeechOnly() {
  const context = useContext(SpeechOnlyContext);
  if (context === undefined) {
    throw new Error('useSpeechOnly must be used within a SpeechOnlyProvider');
  }
  return context;
}
