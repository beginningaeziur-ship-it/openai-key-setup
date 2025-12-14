import React, { createContext, useContext, useState, useCallback, useRef, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Voice options matching OpenAI/ElevenLabs voices
export type VoiceId = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

interface VoiceSettingsContextType {
  // Settings state
  voiceEnabled: boolean;
  voiceId: VoiceId;
  speakingSpeed: number; // 0.5 to 2.0
  volume: number; // 0 to 1
  useBrowserTTS: boolean; // Whether using browser fallback
  
  // Playback state
  isSpeaking: boolean;
  isLoading: boolean;
  
  // Actions
  setVoiceEnabled: (enabled: boolean) => void;
  setVoiceId: (voice: VoiceId) => void;
  setSpeakingSpeed: (speed: number) => void;
  setVolume: (volume: number) => void;
  setUseBrowserTTS: (use: boolean) => void;
  
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
  USE_BROWSER_TTS: 'sai_use_browser_tts',
};

// Browser voice mapping for fallback
const BROWSER_VOICE_MAP: Record<VoiceId, string[]> = {
  'alloy': ['Google US English', 'Samantha', 'Microsoft Zira'],
  'echo': ['Google UK English Male', 'Daniel', 'Microsoft David'],
  'fable': ['Google UK English Female', 'Karen', 'Microsoft Hazel'],
  'onyx': ['Alex', 'Microsoft Mark', 'Google US English'],
  'nova': ['Samantha', 'Google US English', 'Microsoft Zira'],
  'shimmer': ['Victoria', 'Google UK English Female', 'Microsoft Susan'],
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

  const [useBrowserTTS, setUseBrowserTTSState] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.USE_BROWSER_TTS);
    return stored === 'true';
  });
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for audio management - SINGLE audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speakLockRef = useRef<boolean>(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
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

  const setUseBrowserTTS = useCallback((use: boolean) => {
    setUseBrowserTTSState(use);
    localStorage.setItem(STORAGE_KEYS.USE_BROWSER_TTS, String(use));
  }, []);
  
  // Stop any currently playing audio
  const stopSpeaking = useCallback(() => {
    // Stop ElevenLabs audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.oncanplaythrough = null;
      audioRef.current = null;
    }
    // Stop browser speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setIsSpeaking(false);
    speakLockRef.current = false;
  }, []);

  // Browser TTS fallback function
  const speakWithBrowser = useCallback((text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Browser speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      
      // Try to find a matching voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoices = BROWSER_VOICE_MAP[voiceId] || BROWSER_VOICE_MAP['nova'];
      
      for (const preferred of preferredVoices) {
        const match = voices.find(v => 
          v.name.toLowerCase().includes(preferred.toLowerCase())
        );
        if (match) {
          utterance.voice = match;
          break;
        }
      }
      
      // If no match, try to find any English voice
      if (!utterance.voice) {
        const englishVoice = voices.find(v => v.lang.startsWith('en'));
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }
      
      utterance.rate = speakingSpeed;
      utterance.volume = volume;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsLoading(false);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        speakLockRef.current = false;
        utteranceRef.current = null;
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error('[VoiceSettings] Browser TTS error:', event.error);
        setIsSpeaking(false);
        speakLockRef.current = false;
        utteranceRef.current = null;
        reject(new Error(event.error));
      };
      
      window.speechSynthesis.speak(utterance);
    });
  }, [voiceId, speakingSpeed, volume]);
  
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

    // If browser TTS is enabled (fallback mode), use it directly
    if (useBrowserTTS) {
      console.log('[VoiceSettings] Using browser TTS (fallback mode)');
      try {
        await speakWithBrowser(text);
      } catch (err) {
        console.error('[VoiceSettings] Browser TTS failed:', err);
        speakLockRef.current = false;
        setIsLoading(false);
      }
      return;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('sai-voice', {
        body: { text, voice: voiceId },
      });
      
      // Check for quota exceeded or any error that should trigger fallback
      const hasError = error || data?.error;
      const shouldFallback = data?.fallbackToBrowser || 
        data?.error?.includes?.('quota_exceeded') ||
        data?.error?.includes?.('401') ||
        data?.error?.includes?.('402') ||
        error?.message?.includes?.('402') ||
        error?.message?.includes?.('quota');
      
      if (hasError && shouldFallback) {
        console.log('[VoiceSettings] ElevenLabs unavailable, switching to browser TTS');
        setUseBrowserTTS(true);
        
        // Show friendly toast about fallback
        toast({
          title: "Voice still working",
          description: "SAI switched to free browser voice. Everything works the same.",
          duration: 4000,
        });
        
        try {
          await speakWithBrowser(text);
        } catch (browserErr) {
          console.error('[VoiceSettings] Browser TTS fallback failed:', browserErr);
          speakLockRef.current = false;
          setIsLoading(false);
        }
        return;
      }
      
      if (hasError) {
        console.error('[VoiceSettings] TTS error:', error?.message || data?.error);
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
      
      // Try browser fallback on any network/API error
      console.log('[VoiceSettings] Attempting browser TTS fallback');
      try {
        await speakWithBrowser(text);
      } catch (browserErr) {
        console.error('[VoiceSettings] Browser TTS fallback failed:', browserErr);
        setIsLoading(false);
        speakLockRef.current = false;
      }
    }
  }, [voiceEnabled, voiceId, volume, speakingSpeed, useBrowserTTS, stopSpeaking, speakWithBrowser, setUseBrowserTTS]);

  // Load voices when available (for browser TTS)
  useEffect(() => {
    if (window.speechSynthesis) {
      // Voices may load async
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
      // Trigger initial load
      window.speechSynthesis.getVoices();
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  return (
    <VoiceSettingsContext.Provider value={{
      voiceEnabled,
      voiceId,
      speakingSpeed,
      volume,
      useBrowserTTS,
      isSpeaking,
      isLoading,
      setVoiceEnabled,
      setVoiceId,
      setSpeakingSpeed,
      setVolume,
      setUseBrowserTTS,
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
