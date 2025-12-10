// Hook for SAI responses routed through 3-path system
import { useCallback, useMemo } from 'react';
import { useSupportMap } from '@/contexts/SupportMapContext';
import { useEmotionalState } from '@/contexts/EmotionalStateContext';
import { useSelfStart } from '@/contexts/SelfStartContext';
import { 
  detectResponsePath, 
  getPathSystemPrompt, 
  getPathOpening,
  type ResponsePath,
  type PathConfig 
} from '@/lib/saiResponsePath';

interface UseSAIResponseOptions {
  manualPathOverride?: ResponsePath;
}

interface SAIResponseContext {
  // Current path detection
  currentPath: ResponsePath;
  pathConfig: PathConfig;
  
  // Get system prompt modifier for AI
  getSystemPromptModifier: () => string;
  
  // Analyze incoming message and get path
  analyzeMessage: (message: string) => PathConfig;
  
  // Get appropriate opening for current path
  getOpening: () => string;
  
  // Check if distress intervention is needed
  shouldTriggerIntervention: (message: string) => boolean;
  
  // Manual path switching
  setManualPath: (path: ResponsePath | null) => void;
  manualPath: ResponsePath | null;
}

export function useSAIResponse(options?: UseSAIResponseOptions): SAIResponseContext {
  const { supportMap, updateAdaptations } = useSupportMap();
  const { emotionalState, setDistressLevel } = useEmotionalState();
  const { triggerDistressCheckIn } = useSelfStart();

  // Get manual path from support map adaptations
  const manualPath = supportMap.adaptations.tonePreference as ResponsePath;

  // Set manual path override
  const setManualPath = useCallback((path: ResponsePath | null) => {
    if (path) {
      updateAdaptations({ tonePreference: path });
    }
  }, [updateAdaptations]);

  // Analyze a message to determine optimal path
  const analyzeMessage = useCallback((message: string): PathConfig => {
    const override = options?.manualPathOverride || 
      (supportMap.adaptations.tonePreference !== 'honest' 
        ? supportMap.adaptations.tonePreference as ResponsePath 
        : undefined);
    
    return detectResponsePath(
      message,
      emotionalState.distressLevel,
      override
    );
  }, [emotionalState.distressLevel, supportMap.adaptations.tonePreference, options?.manualPathOverride]);

  // Current path based on recent state
  const currentPath = useMemo((): ResponsePath => {
    if (options?.manualPathOverride) return options.manualPathOverride;
    if (emotionalState.distressLevel === 'high') return 'gentle';
    return supportMap.adaptations.tonePreference as ResponsePath;
  }, [emotionalState.distressLevel, supportMap.adaptations.tonePreference, options?.manualPathOverride]);

  // Path config for current state
  const pathConfig = useMemo((): PathConfig => ({
    path: currentPath,
    reason: emotionalState.distressLevel === 'high' 
      ? 'High distress detected' 
      : 'User preference',
    confidenceScore: 0.9,
  }), [currentPath, emotionalState.distressLevel]);

  // Get system prompt modifier
  const getSystemPromptModifier = useCallback((): string => {
    return getPathSystemPrompt(currentPath);
  }, [currentPath]);

  // Get path-appropriate opening
  const getOpening = useCallback((): string => {
    return getPathOpening(currentPath);
  }, [currentPath]);

  // Check if distress intervention is needed
  const shouldTriggerIntervention = useCallback((message: string): boolean => {
    const config = analyzeMessage(message);
    
    // If path is gentle with high confidence, trigger intervention
    if (config.path === 'gentle' && config.confidenceScore > 0.8) {
      // Update emotional state
      setDistressLevel('high');
      
      // Trigger check-in after a brief delay
      setTimeout(() => {
        triggerDistressCheckIn('high');
      }, 2000);
      
      return true;
    }
    
    // Medium distress
    if (config.path === 'gentle' && config.confidenceScore > 0.6) {
      setDistressLevel('medium');
      return false;
    }
    
    return false;
  }, [analyzeMessage, setDistressLevel, triggerDistressCheckIn]);

  return {
    currentPath,
    pathConfig,
    getSystemPromptModifier,
    analyzeMessage,
    getOpening,
    shouldTriggerIntervention,
    setManualPath,
    manualPath,
  };
}
