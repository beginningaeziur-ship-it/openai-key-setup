import { useCallback, useRef, useState, useEffect } from 'react';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useMicrophone } from '@/contexts/MicrophoneContext';

interface UseSpeakThenListenOptions {
  listenDurationMs?: number;
  onTranscript?: (transcript: string) => void;
}

/**
 * Hook for managing the speak-then-listen pattern during onboarding
 * 
 * Rules:
 * 1. SAI speaks first - mic is OFF during speaking
 * 2. After SAI finishes, mic activates for a listening window
 * 3. Mic auto-closes after duration or when user stops speaking
 */
export function useSpeakThenListen(options: UseSpeakThenListenOptions = {}) {
  const { listenDurationMs = 10000, onTranscript } = options;
  
  const { speak, stopSpeaking, isSpeaking, voiceEnabled, setVoiceEnabled } = useVoiceSettings();
  const { 
    enableMicrophone, 
    disableMicrophone,
    setMuted,
    isMicEnabled, 
    isMicMuted,
    isListening, 
    lastTranscript, 
    clearTranscript 
  } = useMicrophone();
  
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
  const listenTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedRef = useRef<string>('');

  // Ensure voice is enabled for onboarding
  useEffect(() => {
    if (!voiceEnabled) {
      setVoiceEnabled(true);
    }
  }, [voiceEnabled, setVoiceEnabled]);

  // Keep mic muted while SAI is speaking
  useEffect(() => {
    if (isSpeaking && isMicEnabled && !isMicMuted) {
      setMuted(true);
    }
  }, [isSpeaking, isMicEnabled, isMicMuted, setMuted]);

  // Process transcripts when listening
  useEffect(() => {
    if (isWaitingForResponse && lastTranscript && lastTranscript !== lastProcessedRef.current) {
      lastProcessedRef.current = lastTranscript;
      onTranscript?.(lastTranscript);
      clearTranscript();
    }
  }, [lastTranscript, isWaitingForResponse, onTranscript, clearTranscript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (listenTimeoutRef.current) {
        clearTimeout(listenTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Speak text, then optionally open listening window
   */
  const speakThenListen = useCallback(async (
    text: string, 
    shouldListenAfter: boolean = false
  ): Promise<void> => {
    // Ensure mic is muted while speaking
    if (isMicEnabled && !isMicMuted) {
      setMuted(true);
    }
    
    setIsWaitingForResponse(false);
    setHasSpoken(false);
    
    // Speak the text
    await speak(text);
    setHasSpoken(true);
    
    // If we should listen after, activate mic
    if (shouldListenAfter) {
      startListening();
    }
  }, [speak, isMicEnabled, isMicMuted, setMuted]);

  /**
   * Start listening window - mic activates only now
   */
  const startListening = useCallback(async () => {
    // Clear any existing timeout
    if (listenTimeoutRef.current) {
      clearTimeout(listenTimeoutRef.current);
    }
    
    setIsWaitingForResponse(true);
    
    // Enable and unmute mic
    if (!isMicEnabled) {
      try {
        await enableMicrophone();
      } catch (e) {
        console.log('[SpeakThenListen] Could not enable mic, user will use buttons');
        return;
      }
    } else if (isMicMuted) {
      setMuted(false);
    }
    
    // Auto-close after duration
    listenTimeoutRef.current = setTimeout(() => {
      stopListening();
    }, listenDurationMs);
  }, [isMicEnabled, isMicMuted, enableMicrophone, setMuted, listenDurationMs]);

  /**
   * Stop listening window - mute mic
   */
  const stopListening = useCallback(() => {
    setIsWaitingForResponse(false);
    
    if (listenTimeoutRef.current) {
      clearTimeout(listenTimeoutRef.current);
      listenTimeoutRef.current = null;
    }
    
    // Mute (don't fully disable) so we can re-enable easily
    if (isMicEnabled && !isMicMuted) {
      setMuted(true);
    }
  }, [isMicEnabled, isMicMuted, setMuted]);

  /**
   * Speak without expecting response
   */
  const speakOnly = useCallback(async (text: string): Promise<void> => {
    if (isMicEnabled && !isMicMuted) {
      setMuted(true);
    }
    setIsWaitingForResponse(false);
    await speak(text);
    setHasSpoken(true);
  }, [speak, isMicEnabled, isMicMuted, setMuted]);

  return {
    // State
    isSpeaking,
    isWaitingForResponse,
    isListening: isWaitingForResponse && isListening,
    hasSpoken,
    voiceEnabled,
    
    // Actions
    speakThenListen,
    speakOnly,
    startListening,
    stopListening,
    stopSpeaking,
    
    // Voice control
    setVoiceEnabled,
  };
}

