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
  const lastStartTimeRef = useRef<number>(0); // Track when recognition started
  const restartCountRef = useRef<number>(0); // Track restart attempts
  const MAX_RESTART_ATTEMPTS = 5; // Max restarts before giving up
  const MIN_LISTEN_DURATION = 3000; // Minimum ms before allowing restart
  
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
    console.log('[SAI Mic] startListening called, isSupported:', isSupported, 'isRestarting:', isRestartingRef.current);
    
    if (!isSupported) {
      console.log('[SAI Mic] Not supported, aborting');
      return;
    }
    if (isRestartingRef.current) {
      console.log('[SAI Mic] Already restarting, aborting');
      return;
    }
    
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
      console.log('[SAI Mic] Creating speech recognition instance...');
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.error('[SAI Mic] SpeechRecognition API not available');
        isRestartingRef.current = false;
        return;
      }
      
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        // Reset restart count on successful result
        restartCountRef.current = 0;
        
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
        console.error('[SAI Mic] Recognition error:', event.error, event);
        isRestartingRef.current = false;
        
        if (event.error === 'not-allowed') {
          setHasPermission(false);
          setIsMicEnabled(false);
          localStorage.setItem('sai_mic_enabled', 'false');
          isActiveRef.current = false;
          setIsListening(false);
          restartCountRef.current = 0;
          toast.error('Microphone access denied', {
            description: 'Please allow microphone access in your browser settings.',
          });
        } else if (event.error === 'aborted') {
          // Intentional abort, don't restart
          setIsListening(false);
        } else if (event.error === 'no-speech') {
          // No speech detected - this is normal, don't count as failure
          console.log('[SAI Mic] No speech detected');
        } else if (event.error === 'network') {
          console.error('[SAI Mic] Network error - speech recognition requires internet');
          isActiveRef.current = false;
          toast.error('Network error', {
            description: 'Voice recognition requires an internet connection.',
          });
        } else {
          // Other error, increment restart count
          restartCountRef.current++;
          console.log('[SAI Mic] Error, restart count:', restartCountRef.current);
          setIsListening(false);
        }
      };
      
      recognition.onend = () => {
        const listenDuration = Date.now() - lastStartTimeRef.current;
        console.log('[SAI Mic] Recognition ended after', listenDuration, 'ms, isActive:', isActiveRef.current);
        isRestartingRef.current = false;
        setIsListening(false);
        
        // Only restart if we should still be active and haven't exceeded max attempts
        if (isActiveRef.current) {
          if (restartCountRef.current >= MAX_RESTART_ATTEMPTS) {
            console.log('[SAI Mic] Max restart attempts reached, stopping');
            isActiveRef.current = false;
            toast.error('Voice recognition stopped', {
              description: 'Too many errors. Please click the mic button to try again.',
            });
            return;
          }
          
          // If it ran for a decent time, reset restart count
          if (listenDuration > MIN_LISTEN_DURATION) {
            restartCountRef.current = 0;
          }
          
          // Delay restart based on how quickly it failed
          const delay = listenDuration < 1000 ? 2000 : 500;
          restartTimeoutRef.current = setTimeout(() => {
            if (isActiveRef.current) {
              console.log('[SAI Mic] Restarting recognition...');
              startListening();
            }
          }, delay);
        }
      };
      
      recognitionRef.current = recognition;
      lastStartTimeRef.current = Date.now();
      recognition.start();
      setIsListening(true);
      isRestartingRef.current = false;
      console.log('[SAI Mic] Speech recognition started successfully');
    } catch (err) {
      console.error('[SAI Mic] Failed to start speech recognition:', err);
      isRestartingRef.current = false;
      setIsListening(false);
      restartCountRef.current++;
      
      if (restartCountRef.current >= MAX_RESTART_ATTEMPTS) {
        toast.error('Voice recognition failed', {
          description: 'Could not start speech recognition. Try refreshing the page.',
        });
      }
    }
  }, [isSupported, clearRestartTimeout]);

  // Enable microphone and get audio stream
  const enableMicrophone = useCallback(async (): Promise<boolean> => {
    console.log('[SAI Mic] Attempting to enable microphone...');
    console.log('[SAI Mic] isSupported:', isSupported);
    console.log('[SAI Mic] Browser:', navigator.userAgent);
    
    if (!isSupported) {
      console.error('[SAI Mic] Speech recognition not supported');
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

      console.log('[SAI Mic] Requesting microphone permission...');
      
      // Request microphone permission and keep the stream for audio analysis
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      console.log('[SAI Mic] Microphone permission granted, tracks:', stream.getAudioTracks().length);
      
      // Store stream for voice stress analysis
      streamRef.current = stream;
      setAudioStream(stream);
      
      setHasPermission(true);
      setIsMicEnabled(true);
      setIsMicMuted(false);
      isActiveRef.current = true;
      restartCountRef.current = 0; // Reset restart count on fresh enable
      localStorage.setItem('sai_mic_enabled', 'true');
      localStorage.setItem('sai_mic_muted', 'false');
      
      // Start listening after a short delay
      setTimeout(() => {
        if (isActiveRef.current) {
          console.log('[SAI Mic] Starting speech recognition...');
          startListening();
        }
      }, 300);
      
      toast.success('Microphone enabled', {
        description: 'SAI is now listening. Mute anytime with the mic button.',
      });
      
      return true;
    } catch (err: any) {
      console.error('[SAI Mic] Permission denied:', err);
      console.error('[SAI Mic] Error name:', err?.name);
      console.error('[SAI Mic] Error message:', err?.message);
      
      setHasPermission(false);
      
      let errorMessage = 'Please allow microphone access to enable voice features.';
      if (err?.name === 'NotAllowedError') {
        errorMessage = 'Microphone access was denied. Please check your browser settings.';
      } else if (err?.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone.';
      } else if (err?.name === 'NotReadableError') {
        errorMessage = 'Microphone is in use by another application.';
      }
      
      toast.error('Microphone access denied', {
        description: errorMessage,
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
      restartCountRef.current = 0; // Reset on unmute
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
