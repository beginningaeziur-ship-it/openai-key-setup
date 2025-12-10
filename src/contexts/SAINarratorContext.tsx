import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useVoiceSettings } from './VoiceSettingsContext';
import { useMicrophone } from './MicrophoneContext';

interface NarrationState {
  currentScreen: string;
  isNarrating: boolean;
  hasAskedQuestions: boolean;
  isListening: boolean;
  isMuted: boolean;
  narratedScreens: Set<string>;
}

interface SAINarratorContextType {
  // State
  isNarrating: boolean;
  isListening: boolean;
  isMuted: boolean;
  currentScreen: string;
  
  // Actions
  narrateScreen: (screenId: string, narration: string, askQuestions?: boolean) => Promise<void>;
  repeatNarration: () => Promise<void>;
  toggleMute: () => void;
  stopNarration: () => void;
  setCurrentScreen: (screenId: string) => void;
  hasNarratedScreen: (screenId: string) => boolean;
  markScreenNarrated: (screenId: string) => void;
  
  // Listening
  startListeningWindow: (durationMs?: number) => void;
  stopListening: () => void;
}

const SAINarratorContext = createContext<SAINarratorContextType | null>(null);

export function SAINarratorProvider({ children }: { children: React.ReactNode }) {
  const { speak, stopSpeaking, voiceEnabled } = useVoiceSettings();
  const { startListening: startMic, stopListening: stopMic, isListening: micListening } = useMicrophone();
  
  const [state, setState] = useState<NarrationState>({
    currentScreen: '',
    isNarrating: false,
    hasAskedQuestions: false,
    isListening: false,
    isMuted: false,
    narratedScreens: new Set(),
  });
  
  const lastNarrationRef = useRef<string>('');
  const listeningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear listening timeout on unmount
  useEffect(() => {
    return () => {
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
    };
  }, []);

  const narrateScreen = useCallback(async (
    screenId: string, 
    narration: string, 
    askQuestions: boolean = true
  ) => {
    if (state.isMuted) return;
    
    setState(prev => ({ ...prev, isNarrating: true, currentScreen: screenId }));
    lastNarrationRef.current = narration;
    
    // Build full narration with optional question
    const fullNarration = askQuestions 
      ? `${narration} Do you have any questions?`
      : narration;
    
    if (voiceEnabled && !state.isMuted) {
      await speak(fullNarration);
    }
    
    setState(prev => ({ 
      ...prev, 
      isNarrating: false,
      hasAskedQuestions: askQuestions,
      narratedScreens: new Set([...prev.narratedScreens, screenId])
    }));
    
    // If we asked questions and mic is available, start listening window
    if (askQuestions) {
      startListeningWindow(10000); // 10 second listening window
    }
  }, [speak, voiceEnabled, state.isMuted]);

  const repeatNarration = useCallback(async () => {
    if (lastNarrationRef.current && !state.isMuted) {
      setState(prev => ({ ...prev, isNarrating: true }));
      if (voiceEnabled) {
        await speak(lastNarrationRef.current);
      }
      setState(prev => ({ ...prev, isNarrating: false }));
    }
  }, [speak, voiceEnabled, state.isMuted]);

  const toggleMute = useCallback(() => {
    setState(prev => {
      if (!prev.isMuted) {
        stopSpeaking();
      }
      return { ...prev, isMuted: !prev.isMuted };
    });
  }, [stopSpeaking]);

  const stopNarration = useCallback(() => {
    stopSpeaking();
    setState(prev => ({ ...prev, isNarrating: false }));
  }, [stopSpeaking]);

  const setCurrentScreen = useCallback((screenId: string) => {
    setState(prev => ({ ...prev, currentScreen: screenId }));
  }, []);

  const hasNarratedScreen = useCallback((screenId: string) => {
    return state.narratedScreens.has(screenId);
  }, [state.narratedScreens]);

  const markScreenNarrated = useCallback((screenId: string) => {
    setState(prev => ({
      ...prev,
      narratedScreens: new Set([...prev.narratedScreens, screenId])
    }));
  }, []);

  const startListeningWindow = useCallback((durationMs: number = 10000) => {
    setState(prev => ({ ...prev, isListening: true }));
    startMic?.();
    
    // Auto-stop after duration
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
    }
    listeningTimeoutRef.current = setTimeout(() => {
      stopListening();
    }, durationMs);
  }, [startMic]);

  const stopListening = useCallback(() => {
    setState(prev => ({ ...prev, isListening: false }));
    stopMic?.();
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = null;
    }
  }, [stopMic]);

  return (
    <SAINarratorContext.Provider value={{
      isNarrating: state.isNarrating,
      isListening: state.isListening || micListening,
      isMuted: state.isMuted,
      currentScreen: state.currentScreen,
      narrateScreen,
      repeatNarration,
      toggleMute,
      stopNarration,
      setCurrentScreen,
      hasNarratedScreen,
      markScreenNarrated,
      startListeningWindow,
      stopListening,
    }}>
      {children}
    </SAINarratorContext.Provider>
  );
}

export function useSAINarrator() {
  const context = useContext(SAINarratorContext);
  if (!context) {
    throw new Error('useSAINarrator must be used within SAINarratorProvider');
  }
  return context;
}
