import React, { createContext, useContext, useState, useCallback, useRef, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Voice options matching OpenAI/ElevenLabs voices
export type VoiceId = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

interface VoiceSettingsContextType {
  // Settings state
  voiceEnabled: boolean;
  voiceId: VoiceId;
  speakingSpeed: number; // 0.5 to 2.0
  volume: number; // 0 to 1
  
  // Playback state
  isSpeaking: boolean;
  isLoading: boolean;
  
  // Actions
  setVoiceEnabled: (enabled: boolean) => void;
  setVoiceId: (voice: VoiceId) => void;
  setSpeakingSpeed: (speed: number) => void;
  setVolume: (volume: number) => void;
  
  // TTS functions - single speech output path
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => void;
}

const VoiceSettingsContext = createContext<VoiceSettingsContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  VOICE_ENABLED: 'sai_voice_enabled',
  VOICE_ID: 'sai_voice_id',
  SPEAKING_SPEED: 'sai_speaking_speed',
  VOLUME: 'sai_volume',
};

interface VoiceSettingsProviderProps {
  children: ReactNode;
}

export function VoiceSettingsProvider({ children }: VoiceSettingsProviderProps) {
  // Initialize from localStorage
  const [voiceEnabled, setVoiceEnabledState] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.VOICE_ENABLED);
    return stored !== 'false'; // Default to true
  });
  
  const [voiceId, setVoiceIdState] = useState<VoiceId>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.VOICE_ID);
    return (stored as VoiceId) || 'nova';
  });
  
  const [speakingSpeed, setSpeakingSpeedState] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SPEAKING_SPEED);
    return stored ? parseFloat(stored) : 1.0;
  });
  
  const [volume, setVolumeState] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.VOLUME);
    return stored ? parseFloat(stored) : 1.0;
  });
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for audio management - SINGLE audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speakLockRef = useRef<boolean>(false);
  
  // Setters that persist to localStorage
  const setVoiceEnabled = useCallback((enabled: boolean) => {
    setVoiceEnabledState(enabled);
    localStorage.setItem(STORAGE_KEYS.VOICE_ENABLED, String(enabled));
    if (!enabled) {
      stopSpeaking();
    }
  }, []);
  
  const setVoiceId = useCallback((voice: VoiceId) => {
    setVoiceIdState(voice);
    localStorage.setItem(STORAGE_KEYS.VOICE_ID, voice);
  }, []);
  
  const setSpeakingSpeed = useCallback((speed: number) => {
    const clampedSpeed = Math.max(0.5, Math.min(2.0, speed));
    setSpeakingSpeedState(clampedSpeed);
    localStorage.setItem(STORAGE_KEYS.SPEAKING_SPEED, String(clampedSpeed));
  }, []);
  
  const setVolume = useCallback((vol: number) => {
    const clampedVol = Math.max(0, Math.min(1, vol));
    setVolumeState(clampedVol);
    localStorage.setItem(STORAGE_KEYS.VOLUME, String(clampedVol));
    // Update current audio if playing
    if (audioRef.current) {
      audioRef.current.volume = clampedVol;
    }
  }, []);
  
  // Stop any currently playing audio
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.oncanplaythrough = null;
      audioRef.current = null;
    }
    setIsSpeaking(false);
    speakLockRef.current = false;
  }, []);
  
  // Single speak function - the ONLY way to play TTS
  const speak = useCallback(async (text: string): Promise<void> => {
    if (!text.trim()) return;
    if (!voiceEnabled) return;
    
    // Prevent double-trigger with lock
    if (speakLockRef.current) {
      console.log('[VoiceSettings] Speak blocked - already speaking');
      return;
    }
    
    speakLockRef.current = true;
    
    // Stop any previous audio first
    stopSpeaking();
    speakLockRef.current = true; // Re-set after stopSpeaking clears it
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('sai-voice', {
        body: { text, voice: voiceId },
      });
      
      if (error) {
        console.error('[VoiceSettings] TTS error:', error.message);
        speakLockRef.current = false;
        setIsLoading(false);
        return;
      }
      
      if (data?.error) {
        console.error('[VoiceSettings] TTS error:', data.error);
        speakLockRef.current = false;
        setIsLoading(false);
        return;
      }
      
      if (data?.audioContent) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        audio.volume = volume;
        audio.playbackRate = speakingSpeed;
        audioRef.current = audio;
        
        setIsLoading(false);
        setIsSpeaking(true);
        
        audio.onended = () => {
          setIsSpeaking(false);
          speakLockRef.current = false;
          if (audioRef.current === audio) {
            audioRef.current = null;
          }
        };
        
        audio.onerror = (e) => {
          console.error('[VoiceSettings] Audio playback error:', e);
          setIsSpeaking(false);
          speakLockRef.current = false;
          if (audioRef.current === audio) {
            audioRef.current = null;
          }
        };
        
        try {
          await audio.play();
        } catch (playError) {
          console.error('[VoiceSettings] Audio play failed:', playError);
          setIsSpeaking(false);
          speakLockRef.current = false;
        }
      } else {
        setIsLoading(false);
        speakLockRef.current = false;
      }
    } catch (err) {
      console.error('[VoiceSettings] Failed to speak:', err);
      setIsLoading(false);
      speakLockRef.current = false;
    }
  }, [voiceEnabled, voiceId, volume, speakingSpeed, stopSpeaking]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  return (
    <VoiceSettingsContext.Provider value={{
      voiceEnabled,
      voiceId,
      speakingSpeed,
      volume,
      isSpeaking,
      isLoading,
      setVoiceEnabled,
      setVoiceId,
      setSpeakingSpeed,
      setVolume,
      speak,
      stopSpeaking,
    }}>
      {children}
    </VoiceSettingsContext.Provider>
  );
}

export function useVoiceSettings() {
  const context = useContext(VoiceSettingsContext);
  if (context === undefined) {
    throw new Error('useVoiceSettings must be used within a VoiceSettingsProvider');
  }
  return context;
}
