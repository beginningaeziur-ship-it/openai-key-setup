/**
 * React hook wrapping the AEZUIR State Engine.
 * Provides currentState, uiConfig, setManualState, and cycleState (debug).
 */
import { useCallback, useEffect, useState } from "react";
import {
  stateEngine,
  getUIConfigFor,
  STATE_ORDER,
  type UserState,
  type UIConfig,
} from "./stateEngine";

export interface UseStateEngineReturn {
  currentState: UserState;
  uiConfig: UIConfig;
  setManualState: (state: UserState) => void;
  cycleState: () => void;
}

export function useStateEngine(): UseStateEngineReturn {
  const [currentState, setCurrentState] = useState<UserState>(
    stateEngine.currentState
  );

  useEffect(() => {
    setCurrentState(stateEngine.currentState);
    return stateEngine.subscribe(setCurrentState);
  }, []);

  const setManualState = useCallback((s: UserState) => {
    stateEngine.setManualState(s);
  }, []);

  const cycleState = useCallback(() => {
    const idx = STATE_ORDER.indexOf(stateEngine.currentState);
    const next = STATE_ORDER[(idx + 1) % STATE_ORDER.length];
    stateEngine.setManualState(next);
  }, []);

  return {
    currentState,
    uiConfig: getUIConfigFor(currentState),
    setManualState,
    cycleState,
  };
}
