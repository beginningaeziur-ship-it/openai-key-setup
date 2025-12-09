import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { toast } from 'sonner';

interface MicrophoneContextType {
  // State
  isMicEnabled: boolean;
  isMicMuted: boolean;
  isListening: boolean;
  hasPermission: boolean | null;
  isSupported: boolean;
  lastTranscript: string;
  audioStream: MediaStream | null;
  
  // Actions
  enableMicrophone: () => Promise<boolean>;
  disableMicrophone: () => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  
  // Warning state
  hasSeenWarning: boolean;
  acknowledgeWarning: () => void;
}

const MicrophoneContext = createContext<MicrophoneContextType | undefined>(undefined);

interface SpeechRecognitionType extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  onspeechend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionType;
    webkitSpeechRecognition: new () => SpeechRecognitionType;
  }
}

export function MicrophoneProvider({ children }: { children: ReactNode }) {
  const [isMicEnabled, setIsMicEnabled] = useState<boolean>(() => {
    return localStorage.getItem('sai_mic_enabled') === 'true';
  });
  const [isMicMuted, setIsMicMuted] = useState<boolean>(() => {
    return localStorage.getItem('sai_mic_muted') === 'true';
  });
  const [isListening, setIsListening] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [lastTranscript, setLastTranscript] = useState('');
  const [hasSeenWarning, setHasSeenWarning] = useState<boolean>(() => {
    return localStorage.getItem('sai_mic_warning_seen') === 'true';
  });
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const isSupported = typeof window !== 'undefined' && 
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    if (!isSupported) return null;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        }
      }
      if (finalTranscript.trim()) {
        setLastTranscript(finalTranscript.trim());
        console.log('[SAI Mic] Heard:', finalTranscript.trim());
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('[SAI Mic] Error:', event.error);
      if (event.error === 'not-allowed') {
        setHasPermission(false);
        setIsMicEnabled(false);
        toast.error('Microphone access denied', {
          description: 'Please allow microphone access in your browser settings.',
        });
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        // Restart on recoverable errors
        setIsListening(false);
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if enabled and not muted
      if (isMicEnabled && !isMicMuted) {
        restartTimeoutRef.current = setTimeout(() => {
          startListening();
        }, 500);
      }
    };
    
    return recognition;
  }, [isSupported, isMicEnabled, isMicMuted]);

  const startListening = useCallback(() => {
    if (!isSupported || isMicMuted || !isMicEnabled) return;
    
    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      
      const recognition = initRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
        console.log('[SAI Mic] Started listening');
      }
    } catch (err) {
      console.error('[SAI Mic] Failed to start:', err);
    }
  }, [isSupported, isMicMuted, isMicEnabled, initRecognition]);

  const stopListening = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsListening(false);
    console.log('[SAI Mic] Stopped listening');
  }, []);

  const enableMicrophone = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Voice input not supported', {
        description: 'Please use Chrome, Edge, or Safari for voice features.',
      });
      return false;
    }

    try {
      // Request microphone permission and keep the stream for audio analysis
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      // Store stream for voice stress analysis
      streamRef.current = stream;
      setAudioStream(stream);
      
      setHasPermission(true);
      setIsMicEnabled(true);
      setIsMicMuted(false);
      localStorage.setItem('sai_mic_enabled', 'true');
      localStorage.setItem('sai_mic_muted', 'false');
      
      toast.success('Microphone enabled', {
        description: 'SAI is now listening. Mute anytime with the mic button.',
      });
      
      return true;
    } catch (err) {
      console.error('[SAI Mic] Permission denied:', err);
      setHasPermission(false);
      toast.error('Microphone access denied', {
        description: 'Please allow microphone access to enable voice features.',
      });
      return false;
    }
  }, [isSupported]);

  const disableMicrophone = useCallback(() => {
    stopListening();
    // Stop and release the audio stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setAudioStream(null);
    }
    setIsMicEnabled(false);
    localStorage.setItem('sai_mic_enabled', 'false');
    toast.info('Microphone disabled');
  }, [stopListening]);

  const toggleMute = useCallback(() => {
    const newMuted = !isMicMuted;
    setIsMicMuted(newMuted);
    localStorage.setItem('sai_mic_muted', String(newMuted));
    
    if (newMuted) {
      stopListening();
      toast.info('Microphone muted');
    } else if (isMicEnabled) {
      startListening();
      toast.info('Microphone unmuted - SAI is listening');
    }
  }, [isMicMuted, isMicEnabled, stopListening, startListening]);

  const setMuted = useCallback((muted: boolean) => {
    setIsMicMuted(muted);
    localStorage.setItem('sai_mic_muted', String(muted));
    
    if (muted) {
      stopListening();
    } else if (isMicEnabled) {
      startListening();
    }
  }, [isMicEnabled, stopListening, startListening]);

  const acknowledgeWarning = useCallback(() => {
    setHasSeenWarning(true);
    localStorage.setItem('sai_mic_warning_seen', 'true');
  }, []);

  // Start/stop listening based on state
  useEffect(() => {
    if (isMicEnabled && !isMicMuted && hasPermission) {
      startListening();
    } else {
      stopListening();
    }
    
    return () => {
      stopListening();
    };
  }, [isMicEnabled, isMicMuted, hasPermission]);

  // Check permission on mount if mic was previously enabled
  useEffect(() => {
    if (isMicEnabled && hasPermission === null) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
          setHasPermission(true);
        })
        .catch(() => {
          setHasPermission(false);
          setIsMicEnabled(false);
          localStorage.setItem('sai_mic_enabled', 'false');
        });
    }
  }, [isMicEnabled, hasPermission]);

  return (
    <MicrophoneContext.Provider value={{
      isMicEnabled,
      isMicMuted,
      isListening,
      hasPermission,
      isSupported,
      lastTranscript,
      audioStream,
      enableMicrophone,
      disableMicrophone,
      toggleMute,
      setMuted,
      hasSeenWarning,
      acknowledgeWarning,
    }}>
      {children}
    </MicrophoneContext.Provider>
  );
}

export function useMicrophone() {
  const context = useContext(MicrophoneContext);
  if (context === undefined) {
    throw new Error('useMicrophone must be used within a MicrophoneProvider');
  }
  return context;
}