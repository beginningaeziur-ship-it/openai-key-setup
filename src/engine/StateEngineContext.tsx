/**
 * Context provider so any room/component can read the current UserState
 * and UIConfig without prop drilling. Wraps useStateEngine.
 */
import { createContext, useContext, type ReactNode } from "react";
import { useStateEngine, type UseStateEngineReturn } from "./useStateEngine";

const StateEngineContext = createContext<UseStateEngineReturn | null>(null);

export function StateEngineProvider({ children }: { children: ReactNode }) {
  const engine = useStateEngine();
  return (
    <StateEngineContext.Provider value={engine}>
      {children}
    </StateEngineContext.Provider>
  );
}

export function useAppState(): UseStateEngineReturn {
  const ctx = useContext(StateEngineContext);
  if (!ctx) {
    throw new Error("useAppState must be used within <StateEngineProvider>");
  }
  return ctx;
}
