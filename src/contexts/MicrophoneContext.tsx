import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { toast } from 'sonner';

interface MicrophoneContextType {
  isMicEnabled: boolean;
  isMicMuted: boolean;
  isListening: boolean;
  hasPermission: boolean | null;
  isSupported: boolean;
  lastTranscript: string;
  audioStream: MediaStream | null;
  
  enableMicrophone: () => Promise<boolean>;
  disableMicrophone: () => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  clearTranscript: () => void;
  
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
  // State initialization - read from localStorage only once
  const [isMicEnabled, setIsMicEnabled] = useState<boolean>(false);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isListening, setIsListening] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [lastTranscript, setLastTranscript] = useState('');
  const [hasSeenWarning, setHasSeenWarning] = useState<boolean>(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  
  // Refs
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isActiveRef = useRef<boolean>(false);
  const isRestartingRef = useRef<boolean>(false);
  const lastStartTimeRef = useRef<number>(0);
  const restartCountRef = useRef<number>(0);
  const hasShownPermissionErrorRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);
  
  // Constants
  const MAX_RESTART_ATTEMPTS = 5;
  const MIN_LISTEN_DURATION = 3000;
  const RESTART_DELAY_SHORT = 500;
  const RESTART_DELAY_LONG = 2000;
  const ENABLE_START_DELAY = 200;

  // Check support once
  const isSupported = typeof window !== 'undefined' && 
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Initialize from localStorage after mount
  // AEZUIR RULE: Mic disabled by default and gated to Safe House
  useEffect(() => {
    const storedMuted = localStorage.getItem('sai_mic_muted') === 'true';
    const storedWarning = localStorage.getItem('sai_mic_warning_seen') === 'true';
    const hasReachedSafeHouse = localStorage.getItem('sai_reached_safe_house') === 'true';
    
    setIsMicMuted(storedMuted);
    setHasSeenWarning(storedWarning);
    
    // AEZUIR: Only auto-enable mic if user has reached Safe House AND previously enabled
    const storedEnabled = localStorage.getItem('sai_mic_enabled') === 'true';
    if (storedEnabled && hasReachedSafeHouse) {
      setIsMicEnabled(storedEnabled);
    }
  }, []);

  // Clear any pending restart timeout
  const clearRestartTimeout = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  }, []);

  // Release audio stream completely
  const releaseAudioStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    setAudioStream(null);
  }, []);

  // Stop speech recognition completely
  const stopListening = useCallback(() => {
    console.log('[SAI Mic] stopListening called');
    clearRestartTimeout();
    isRestartingRef.current = false;
    
    if (recognitionRef.current) {
      try {
        // Remove all handlers first to prevent callbacks
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onspeechend = null;
        recognitionRef.current.abort();
      } catch (e) {
        console.log('[SAI Mic] Error aborting recognition:', e);
      }
      recognitionRef.current = null;
    }
    
    if (mountedRef.current) {
      setIsListening(false);
    }
    console.log('[SAI Mic] Stopped listening');
  }, [clearRestartTimeout]);

  // Start speech recognition
  const startListening = useCallback(() => {
    console.log('[SAI Mic] startListening called');
    
    // Guard: Check all conditions before starting
    if (!isSupported) {
      console.log('[SAI Mic] Not supported');
      return;
    }
    
    if (isRestartingRef.current) {
      console.log('[SAI Mic] Already restarting, skip');
      return;
    }
    
    if (!document.hasFocus()) {
      console.log('[SAI Mic] Page not focused, skip');
      return;
    }
    
    if (!isActiveRef.current) {
      console.log('[SAI Mic] Not active, skip');
      return;
    }
    
    // Mark as restarting to prevent concurrent starts
    isRestartingRef.current = true;
    clearRestartTimeout();
    
    // Clean up any existing recognition instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore abort errors
      }
      recognitionRef.current = null;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.error('[SAI Mic] SpeechRecognition API unavailable');
        isRestartingRef.current = false;
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        // Reset restart count on successful speech
        restartCountRef.current = 0;
        
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          }
        }
        
        if (finalTranscript.trim() && mountedRef.current) {
          console.log('[SAI Mic] Transcript:', finalTranscript.trim());
          setLastTranscript(finalTranscript.trim());
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('[SAI Mic] Error:', event.error);
        isRestartingRef.current = false;
        
        // Handle permission errors - stop completely, show ONE toast
        if (event.error === 'not-allowed' || event.error === 'NotAllowedError') {
          console.log('[SAI Mic] Permission denied');
          isActiveRef.current = false;
          restartCountRef.current = 0;
          
          if (mountedRef.current) {
            setHasPermission(false);
            setIsMicEnabled(false);
            setIsListening(false);
            localStorage.setItem('sai_mic_enabled', 'false');
          }
          
          if (!hasShownPermissionErrorRef.current) {
            hasShownPermissionErrorRef.current = true;
            toast.error('Microphone access denied', {
              description: 'Please allow microphone access in browser settings.',
            });
          }
          return;
        }
        
        // Handle device errors
        if (event.error === 'not-found' || event.error === 'NotFoundError') {
          console.log('[SAI Mic] No microphone found');
          isActiveRef.current = false;
          
          if (mountedRef.current) {
            setHasPermission(false);
            setIsMicEnabled(false);
            setIsListening(false);
          }
          
          if (!hasShownPermissionErrorRef.current) {
            hasShownPermissionErrorRef.current = true;
            toast.error('No microphone found', {
              description: 'Please connect a microphone and try again.',
            });
          }
          return;
        }
        
        if (event.error === 'not-readable' || event.error === 'NotReadableError') {
          console.log('[SAI Mic] Microphone not readable');
          isActiveRef.current = false;
          
          if (mountedRef.current) {
            setHasPermission(false);
            setIsMicEnabled(false);
            setIsListening(false);
          }
          
          if (!hasShownPermissionErrorRef.current) {
            hasShownPermissionErrorRef.current = true;
            toast.error('Microphone unavailable', {
              description: 'Microphone may be in use by another app.',
            });
          }
          return;
        }
        
        // Handle intentional abort - no action needed
        if (event.error === 'aborted') {
          console.log('[SAI Mic] Aborted');
          if (mountedRef.current) {
            setIsListening(false);
          }
          return;
        }
        
        // Handle no-speech - normal, don't count as error
        if (event.error === 'no-speech') {
          console.log('[SAI Mic] No speech detected');
          return;
        }
        
        // Handle network error
        if (event.error === 'network') {
          console.log('[SAI Mic] Network error');
          isActiveRef.current = false;
          
          if (mountedRef.current) {
            setIsListening(false);
          }
          
          toast.error('Network error', {
            description: 'Voice recognition requires internet connection.',
          });
          return;
        }
        
        // Other errors - increment counter
        restartCountRef.current++;
        console.log('[SAI Mic] Other error, restart count:', restartCountRef.current);
        
        if (mountedRef.current) {
          setIsListening(false);
        }
      };
      
      recognition.onend = () => {
        const duration = Date.now() - lastStartTimeRef.current;
        console.log('[SAI Mic] Recognition ended after', duration, 'ms');
        isRestartingRef.current = false;
        
        if (mountedRef.current) {
          setIsListening(false);
        }
        
        // Check if we should restart
        if (!isActiveRef.current) {
          console.log('[SAI Mic] Not active, no restart');
          return;
        }
        
        // Don't block on focus - just log it and continue
        // The preview iframe may not have focus but we still want to listen
        if (!document.hasFocus()) {
          console.log('[SAI Mic] Page not focused, but continuing anyway');
        }
        
        if (restartCountRef.current >= MAX_RESTART_ATTEMPTS) {
          console.log('[SAI Mic] Max restarts reached');
          isActiveRef.current = false;
          toast.error('Voice recognition stopped', {
            description: 'Too many errors. Tap mic button to retry.',
          });
          return;
        }
        
        // Reset counter if it ran long enough
        if (duration > MIN_LISTEN_DURATION) {
          restartCountRef.current = 0;
        }
        
        // Schedule restart with appropriate delay
        const delay = duration < 1000 ? RESTART_DELAY_LONG : RESTART_DELAY_SHORT;
        console.log('[SAI Mic] Scheduling restart in', delay, 'ms');
        
        restartTimeoutRef.current = setTimeout(() => {
          if (isActiveRef.current && document.hasFocus() && mountedRef.current) {
            console.log('[SAI Mic] Restarting...');
            startListening();
          }
        }, delay);
      };
      
      recognitionRef.current = recognition;
      lastStartTimeRef.current = Date.now();
      
      recognition.start();
      
      if (mountedRef.current) {
        setIsListening(true);
      }
      
      isRestartingRef.current = false;
      console.log('[SAI Mic] Started successfully');
      
    } catch (err) {
      console.error('[SAI Mic] Start failed:', err);
      isRestartingRef.current = false;
      
      if (mountedRef.current) {
        setIsListening(false);
      }
      
      restartCountRef.current++;
      
      if (restartCountRef.current >= MAX_RESTART_ATTEMPTS) {
        isActiveRef.current = false;
        toast.error('Voice recognition failed', {
          description: 'Could not start. Try refreshing the page.',
        });
      }
    }
  }, [isSupported, clearRestartTimeout]);

  // Enable microphone - request permissions and start
  const enableMicrophone = useCallback(async (): Promise<boolean> => {
    console.log('[SAI Mic] enableMicrophone called');
    
    if (!isSupported) {
      toast.error('Voice not supported', {
        description: 'Use Chrome, Edge, or Safari for voice features.',
      });
      return false;
    }

    // Reset error flag for fresh attempt
    hasShownPermissionErrorRef.current = false;

    try {
      // Release any existing stream first
      releaseAudioStream();

      console.log('[SAI Mic] Requesting permission...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      console.log('[SAI Mic] Permission granted');
      
      // Store stream
      streamRef.current = stream;
      
      // Update state in correct order
      if (mountedRef.current) {
        setAudioStream(stream);
        setHasPermission(true);
        setIsMicEnabled(true);
        setIsMicMuted(false);
      }
      
      // Update localStorage
      localStorage.setItem('sai_mic_enabled', 'true');
      localStorage.setItem('sai_mic_muted', 'false');
      
      // Set active and reset counters
      isActiveRef.current = true;
      restartCountRef.current = 0;
      
      // Start listening after short delay
      setTimeout(() => {
        if (isActiveRef.current && mountedRef.current) {
          console.log('[SAI Mic] Starting after enable...');
          startListening();
        }
      }, ENABLE_START_DELAY);
      
      toast.success('Microphone enabled', {
        description: 'SAI is listening. Tap mic to mute.',
      });
      
      return true;
      
    } catch (err: any) {
      console.error('[SAI Mic] Enable failed:', err?.name, err?.message);
      
      // Update state
      if (mountedRef.current) {
        setHasPermission(false);
        setIsMicEnabled(false);
        setIsListening(false);
      }
      
      isActiveRef.current = false;
      localStorage.setItem('sai_mic_enabled', 'false');
      
      // Show appropriate error (only once)
      if (!hasShownPermissionErrorRef.current) {
        hasShownPermissionErrorRef.current = true;
        
        let message = 'Please allow microphone access.';
        if (err?.name === 'NotAllowedError') {
          message = 'Microphone access denied. Check browser settings.';
        } else if (err?.name === 'NotFoundError') {
          message = 'No microphone found. Connect one and retry.';
        } else if (err?.name === 'NotReadableError') {
          message = 'Microphone in use by another app.';
        }
        
        toast.error('Microphone error', { description: message });
      }
      
      return false;
    }
  }, [isSupported, releaseAudioStream, startListening]);

  // Disable microphone completely
  const disableMicrophone = useCallback(() => {
    console.log('[SAI Mic] disableMicrophone called');
    
    // Set state first
    isActiveRef.current = false;
    
    // Stop recognition
    stopListening();
    
    // Release audio stream
    releaseAudioStream();
    
    // Update state
    if (mountedRef.current) {
      setIsListening(false);
      setIsMicEnabled(false);
    }
    
    // Update localStorage
    localStorage.setItem('sai_mic_enabled', 'false');
    
    toast.info('Microphone disabled');
  }, [stopListening, releaseAudioStream]);

  // Toggle mute state
  const toggleMute = useCallback(() => {
    const newMuted = !isMicMuted;
    console.log('[SAI Mic] toggleMute:', newMuted);
    
    if (mountedRef.current) {
      setIsMicMuted(newMuted);
    }
    localStorage.setItem('sai_mic_muted', String(newMuted));
    
    if (newMuted) {
      isActiveRef.current = false;
      stopListening();
      toast.info('Microphone muted');
    } else if (isMicEnabled && hasPermission) {
      isActiveRef.current = true;
      restartCountRef.current = 0;
      startListening();
      toast.info('Microphone unmuted');
    }
  }, [isMicMuted, isMicEnabled, hasPermission, stopListening, startListening]);

  // Set mute state directly
  const setMuted = useCallback((muted: boolean) => {
    if (muted === isMicMuted) return;
    
    console.log('[SAI Mic] setMuted:', muted);
    
    if (mountedRef.current) {
      setIsMicMuted(muted);
    }
    localStorage.setItem('sai_mic_muted', String(muted));
    
    if (muted) {
      isActiveRef.current = false;
      stopListening();
    } else if (isMicEnabled && hasPermission) {
      isActiveRef.current = true;
      restartCountRef.current = 0;
      startListening();
    }
  }, [isMicMuted, isMicEnabled, hasPermission, stopListening, startListening]);

  // Clear last transcript
  const clearTranscript = useCallback(() => {
    if (mountedRef.current) {
      setLastTranscript('');
    }
  }, []);

  // Acknowledge warning
  const acknowledgeWarning = useCallback(() => {
    if (mountedRef.current) {
      setHasSeenWarning(true);
    }
    localStorage.setItem('sai_mic_warning_seen', 'true');
  }, []);

  // Auto-reconnect on mount if previously enabled
  useEffect(() => {
    const storedEnabled = localStorage.getItem('sai_mic_enabled') === 'true';
    const storedMuted = localStorage.getItem('sai_mic_muted') === 'true';
    
    if (storedEnabled && hasPermission === null) {
      console.log('[SAI Mic] Auto-reconnecting...');
      
      navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      })
        .then(stream => {
          if (!mountedRef.current) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          
          console.log('[SAI Mic] Auto-reconnect successful');
          streamRef.current = stream;
          setAudioStream(stream);
          setHasPermission(true);
          setIsMicEnabled(true);
          setIsMicMuted(storedMuted);
          
          if (!storedMuted) {
            isActiveRef.current = true;
            restartCountRef.current = 0;
            
            setTimeout(() => {
              if (isActiveRef.current && mountedRef.current) {
                startListening();
              }
            }, ENABLE_START_DELAY);
          }
        })
        .catch((err) => {
          console.log('[SAI Mic] Auto-reconnect failed:', err?.name);
          if (mountedRef.current) {
            setHasPermission(false);
            setIsMicEnabled(false);
          }
          localStorage.setItem('sai_mic_enabled', 'false');
        });
    }
  }, [hasPermission, startListening]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      console.log('[SAI Mic] Unmounting, cleaning up...');
      mountedRef.current = false;
      isActiveRef.current = false;
      
      // Clear timeout
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      
      // Stop recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore
        }
        recognitionRef.current = null;
      }
      
      // Release stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

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
