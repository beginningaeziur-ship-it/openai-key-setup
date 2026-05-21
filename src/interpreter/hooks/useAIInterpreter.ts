// ── useAIInterpreter Hook ──────────────────────────────────────────────────────
// React interface to the AIInterpreterEngine singleton.
// Integrates with the existing TTS system.

import { useState, useEffect, useCallback, useRef } from 'react';
import { AIInterpreterEngine } from '../core/AIInterpreterEngine';
import type {
  InterpreterState,
  InterpreterConfig,
  ParsedIntent,
  AIProvider,
} from '../types/interpreter.types';
import { DEFAULT_CONFIG } from '../types/interpreter.types';

interface UseAIInterpreterOptions {
  config?: Partial<InterpreterConfig>;
  speakFn?: (text: string) => Promise<void>;
  autoActivate?: boolean;
}

export function useAIInterpreter(options: UseAIInterpreterOptions = {}) {
  const engineRef = useRef<AIInterpreterEngine | null>(null);
  const [state, setState] = useState<InterpreterState>(() => ({
    isActive: false,
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    currentIntent: null,
    currentWorkflow: null,
    lastResponse: null,
    config: { ...DEFAULT_CONFIG, ...options.config },
    error: null,
  }));
  const [interimText, setInterimText] = useState('');

  // Initialize engine once
  useEffect(() => {
    const config: InterpreterConfig = { ...DEFAULT_CONFIG, ...options.config };
    engineRef.current = AIInterpreterEngine.getInstance(config);

    if (options.speakFn) {
      engineRef.current.setSpeakFunction(options.speakFn);
    }

    const unsubState = engineRef.current.onStateChange(setState);

    // Subscribe to interim speech text
    const unsubInterim = engineRef.current.voice.onInterim(setInterimText);

    if (options.autoActivate) {
      engineRef.current.activate();
    }

    return () => {
      unsubState();
      unsubInterim();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update speak function when it changes
  useEffect(() => {
    if (options.speakFn && engineRef.current) {
      engineRef.current.setSpeakFunction(options.speakFn);
    }
  }, [options.speakFn]);

  const activate = useCallback(() => {
    engineRef.current?.activate();
  }, []);

  const deactivate = useCallback(() => {
    engineRef.current?.deactivate();
  }, []);

  const toggle = useCallback(() => {
    if (state.isActive) {
      engineRef.current?.deactivate();
    } else {
      engineRef.current?.activate();
    }
  }, [state.isActive]);

  const processCommand = useCallback(async (text: string): Promise<string> => {
    if (!engineRef.current) return '';
    return engineRef.current.processCommand(text);
  }, []);

  const handleIntent = useCallback(async (intent: ParsedIntent) => {
    if (!engineRef.current) return;
    return engineRef.current.handleIntent(intent);
  }, []);

  const switchAI = useCallback((provider: AIProvider) => {
    engineRef.current?.updateConfig({ primaryAI: provider });
  }, []);

  const updateConfig = useCallback((config: Partial<InterpreterConfig>) => {
    engineRef.current?.updateConfig(config);
  }, []);

  const readScreen = useCallback(async (): Promise<string> => {
    if (!engineRef.current) return '';
    return engineRef.current.navigation.readCurrentScreen();
  }, []);

  const clickElement = useCallback(async (target: string) => {
    if (!engineRef.current) return;
    return engineRef.current.automation.execute({ type: 'click', target });
  }, []);

  const typeText = useCallback(async (target: string, value: string) => {
    if (!engineRef.current) return;
    return engineRef.current.automation.execute({ type: 'type', target, value });
  }, []);

  const listenOnce = useCallback(async (): Promise<string> => {
    if (!engineRef.current) return '';
    return engineRef.current.voice.listenOnce();
  }, []);

  return {
    // State
    state,
    interimText,
    isActive: state.isActive,
    isListening: state.isListening,
    isProcessing: state.isProcessing,
    isSpeaking: state.isSpeaking,
    currentIntent: state.currentIntent,
    currentWorkflow: state.currentWorkflow,
    lastResponse: state.lastResponse,
    error: state.error,
    config: state.config,

    // Actions
    activate,
    deactivate,
    toggle,
    processCommand,
    handleIntent,
    switchAI,
    updateConfig,
    readScreen,
    clickElement,
    typeText,
    listenOnce,

    // Sub-systems (for advanced use)
    engine: engineRef.current,
  };
}
