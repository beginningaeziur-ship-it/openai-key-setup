/**
 * TEMPORARY debug button — cycles through NORMAL → REDUCED → SUPPORT → OFFLINE.
 * Remove once state transitions are wired to real signals.
 */
import { useAppState } from "./StateEngineContext";

export function StateDebugCycler() {
  const { currentState, cycleState } = useAppState();
  return (
    <button
      type="button"
      onClick={cycleState}
      aria-label={`Debug: cycle app state. Current state ${currentState}`}
      className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[9999] px-3 py-1 rounded-md bg-black/70 text-white text-xs font-mono border border-white/20 hover:bg-black/90"
    >
      state: {currentState} (tap to cycle)
    </button>
  );
}
