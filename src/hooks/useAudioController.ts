import { useState, useRef, useCallback } from 'react';

type AudioMode = 'idle' | 'sai-speaking' | 'user-listening' | 'processing';

interface UseAudioControllerOptions {
  onModeChange?: (mode: AudioMode) => void;
}

/**
 * Unified audio controller to prevent speech/mic overlap
 * Only one audio mode can be active at a time
 */
export function useAudioController(options: UseAudioControllerOptions = {}) {
  const [currentMode, setCurrentMode] = useState<AudioMode>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const modeLockedRef = useRef<boolean>(false);
  const queuedSpeechRef = useRef<string | null>(null);

  const updateMode = useCallback((mode: AudioMode) => {
    setCurrentMode(mode);
    options.onModeChange?.(mode);
  }, [options]);

  // Stop any currently playing audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.oncanplaythrough = null;
      audioRef.current = null;
    }
  }, []);

  // Request to speak - returns false if mode is locked
  const requestSpeak = useCallback((): boolean => {
    if (modeLockedRef.current && currentMode !== 'idle') {
      return false;
    }
    
    // Stop any current audio
    stopAudio();
    
    modeLockedRef.current = true;
    updateMode('sai-speaking');
    return true;
  }, [currentMode, stopAudio, updateMode]);

  // Called when SAI finishes speaking
  const finishSpeaking = useCallback(() => {
    modeLockedRef.current = false;
    updateMode('idle');
  }, [updateMode]);

  // Request to listen - returns false if SAI is speaking
  const requestListen = useCallback((): boolean => {
    if (currentMode === 'sai-speaking') {
      return false;
    }
    
    stopAudio();
    modeLockedRef.current = true;
    updateMode('user-listening');
    return true;
  }, [currentMode, stopAudio, updateMode]);

  // Called when user finishes speaking
  const finishListening = useCallback(() => {
    updateMode('processing');
  }, [updateMode]);

  // Called when processing is done
  const finishProcessing = useCallback(() => {
    modeLockedRef.current = false;
    updateMode('idle');
  }, [updateMode]);

  // Force reset to idle
  const reset = useCallback(() => {
    stopAudio();
    modeLockedRef.current = false;
    queuedSpeechRef.current = null;
    updateMode('idle');
  }, [stopAudio, updateMode]);

  // Check if can speak
  const canSpeak = currentMode === 'idle' || currentMode === 'processing';
  
  // Check if can listen
  const canListen = currentMode === 'idle';

  return {
    currentMode,
    canSpeak,
    canListen,
    requestSpeak,
    finishSpeaking,
    requestListen,
    finishListening,
    finishProcessing,
    stopAudio,
    reset,
    audioRef,
  };
}
