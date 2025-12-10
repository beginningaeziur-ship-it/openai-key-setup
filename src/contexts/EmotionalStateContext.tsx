import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Emotional state levels
export type DistressLevel = 'low' | 'medium' | 'high';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface EmotionalState {
  distressLevel: DistressLevel;
  confidenceLevel: ConfidenceLevel;
  needsGrounding: boolean;
  slowDownRequests: number; // How many times user asked to slow down
  lastCheckIn: string | null;
  recentChoices: ('gentle' | 'standard' | 'challenge')[]; // Last 10 choices
}

interface EmotionalStateContextType {
  emotionalState: EmotionalState;
  
  // Update functions
  setDistressLevel: (level: DistressLevel) => void;
  setConfidenceLevel: (level: ConfidenceLevel) => void;
  setNeedsGrounding: (needs: boolean) => void;
  recordSlowDownRequest: () => void;
  recordChoice: (choice: 'gentle' | 'standard' | 'challenge') => void;
  recordCheckIn: () => void;
  
  // Computed helpers
  isOverwhelmed: boolean;
  prefersSlow: boolean;
  prefersChallenge: boolean;
  
  // Reset
  resetEmotionalState: () => void;
}

const STORAGE_KEY = 'sai_emotional_state';

const defaultEmotionalState: EmotionalState = {
  distressLevel: 'low',
  confidenceLevel: 'medium',
  needsGrounding: false,
  slowDownRequests: 0,
  lastCheckIn: null,
  recentChoices: [],
};

const EmotionalStateContext = createContext<EmotionalStateContextType | undefined>(undefined);

export function EmotionalStateProvider({ children }: { children: ReactNode }) {
  const [emotionalState, setEmotionalState] = useState<EmotionalState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultEmotionalState;
    } catch {
      return defaultEmotionalState;
    }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emotionalState));
  }, [emotionalState]);

  const setDistressLevel = useCallback((level: DistressLevel) => {
    setEmotionalState(prev => ({ ...prev, distressLevel: level }));
  }, []);

  const setConfidenceLevel = useCallback((level: ConfidenceLevel) => {
    setEmotionalState(prev => ({ ...prev, confidenceLevel: level }));
  }, []);

  const setNeedsGrounding = useCallback((needs: boolean) => {
    setEmotionalState(prev => ({ ...prev, needsGrounding: needs }));
  }, []);

  const recordSlowDownRequest = useCallback(() => {
    setEmotionalState(prev => ({
      ...prev,
      slowDownRequests: prev.slowDownRequests + 1,
    }));
  }, []);

  const recordChoice = useCallback((choice: 'gentle' | 'standard' | 'challenge') => {
    setEmotionalState(prev => ({
      ...prev,
      recentChoices: [...prev.recentChoices.slice(-9), choice], // Keep last 10
    }));
  }, []);

  const recordCheckIn = useCallback(() => {
    setEmotionalState(prev => ({
      ...prev,
      lastCheckIn: new Date().toISOString(),
    }));
  }, []);

  const resetEmotionalState = useCallback(() => {
    setEmotionalState(defaultEmotionalState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Computed values
  const isOverwhelmed = emotionalState.distressLevel === 'high' || emotionalState.needsGrounding;
  
  const prefersSlow = emotionalState.recentChoices.filter(c => c === 'gentle').length > 
    emotionalState.recentChoices.length * 0.5;
  
  const prefersChallenge = emotionalState.recentChoices.filter(c => c === 'challenge').length >
    emotionalState.recentChoices.length * 0.5;

  return (
    <EmotionalStateContext.Provider value={{
      emotionalState,
      setDistressLevel,
      setConfidenceLevel,
      setNeedsGrounding,
      recordSlowDownRequest,
      recordChoice,
      recordCheckIn,
      isOverwhelmed,
      prefersSlow,
      prefersChallenge,
      resetEmotionalState,
    }}>
      {children}
    </EmotionalStateContext.Provider>
  );
}

export function useEmotionalState() {
  const context = useContext(EmotionalStateContext);
  if (context === undefined) {
    throw new Error('useEmotionalState must be used within an EmotionalStateProvider');
  }
  return context;
}
