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
  clearTranscript: () => void;
  
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
  const isActiveRef = useRef<boolean>(false); // Track if we should be listening
  const isRestartingRef = useRef<boolean>(false); // Prevent restart loops
  
  const isSupported = typeof window !== 'undefined' && 
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Clear any pending restart
  const clearRestartTimeout = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  }, []);

  // Stop speech recognition
  const stopListening = useCallback(() => {
    clearRestartTimeout();
    isActiveRef.current = false;
    isRestartingRef.current = false;
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null; // Prevent restart on stop
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore abort errors
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    console.log('[SAI Mic] Stopped listening');
  }, [clearRestartTimeout]);

  // Start speech recognition
  const startListening = useCallback(() => {
    if (!isSupported) return;
    if (isRestartingRef.current) return; // Prevent concurrent starts
    
    clearRestartTimeout();
    
    // Clean up existing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore
      }
      recognitionRef.current = null;
    }

    try {
      isRestartingRef.current = true;
      
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
        isRestartingRef.current = false;
        
        if (event.error === 'not-allowed') {
          setHasPermission(false);
          setIsMicEnabled(false);
          localStorage.setItem('sai_mic_enabled', 'false');
          isActiveRef.current = false;
          setIsListening(false);
          toast.error('Microphone access denied');
        } else if (event.error === 'aborted') {
          // Intentional abort, don't restart
          setIsListening(false);
        } else if (event.error === 'no-speech') {
          // No speech detected, this is normal - will auto-restart via onend
        } else {
          // Other error, try to recover
          setIsListening(false);
        }
      };
      
      recognition.onend = () => {
        isRestartingRef.current = false;
        setIsListening(false);
        
        // Only restart if we should still be active
        if (isActiveRef.current) {
          restartTimeoutRef.current = setTimeout(() => {
            if (isActiveRef.current) {
              startListening();
            }
          }, 1000); // Longer delay to prevent rapid cycling
        }
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      isRestartingRef.current = false;
      console.log('[SAI Mic] Started listening');
    } catch (err) {
      console.error('[SAI Mic] Failed to start:', err);
      isRestartingRef.current = false;
      setIsListening(false);
    }
  }, [isSupported, clearRestartTimeout]);

  // Enable microphone and get audio stream
  const enableMicrophone = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Voice input not supported', {
        description: 'Please use Chrome, Edge, or Safari for voice features.',
      });
      return false;
    }

    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

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
      isActiveRef.current = true;
      localStorage.setItem('sai_mic_enabled', 'true');
      localStorage.setItem('sai_mic_muted', 'false');
      
      // Start listening after a short delay
      setTimeout(() => {
        if (isActiveRef.current) {
          startListening();
        }
      }, 100);
      
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
  }, [isSupported, startListening]);

  // Disable microphone completely
  const disableMicrophone = useCallback(() => {
    isActiveRef.current = false;
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

  // Toggle mute state
  const toggleMute = useCallback(() => {
    const newMuted = !isMicMuted;
    setIsMicMuted(newMuted);
    localStorage.setItem('sai_mic_muted', String(newMuted));
    
    if (newMuted) {
      isActiveRef.current = false;
      stopListening();
      toast.info('Microphone muted');
    } else if (isMicEnabled && hasPermission) {
      isActiveRef.current = true;
      startListening();
      toast.info('Microphone unmuted - SAI is listening');
    }
  }, [isMicMuted, isMicEnabled, hasPermission, stopListening, startListening]);

  // Set mute state directly
  const setMuted = useCallback((muted: boolean) => {
    if (muted === isMicMuted) return;
    
    setIsMicMuted(muted);
    localStorage.setItem('sai_mic_muted', String(muted));
    
    if (muted) {
      isActiveRef.current = false;
      stopListening();
    } else if (isMicEnabled && hasPermission) {
      isActiveRef.current = true;
      startListening();
    }
  }, [isMicMuted, isMicEnabled, hasPermission, stopListening, startListening]);

  // Clear last transcript
  const clearTranscript = useCallback(() => {
    setLastTranscript('');
  }, []);

  // Acknowledge warning
  const acknowledgeWarning = useCallback(() => {
    setHasSeenWarning(true);
    localStorage.setItem('sai_mic_warning_seen', 'true');
  }, []);

  // Check permission on mount if mic was previously enabled
  useEffect(() => {
    if (isMicEnabled && hasPermission === null) {
      navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      })
        .then(stream => {
          streamRef.current = stream;
          setAudioStream(stream);
          setHasPermission(true);
          
          if (!isMicMuted) {
            isActiveRef.current = true;
            setTimeout(() => {
              if (isActiveRef.current) {
                startListening();
              }
            }, 100);
          }
        })
        .catch(() => {
          setHasPermission(false);
          setIsMicEnabled(false);
          localStorage.setItem('sai_mic_enabled', 'false');
        });
    }
  }, []); // Only run once on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      clearRestartTimeout();
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore
        }
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [clearRestartTimeout]);

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
      clearTranscript,
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
