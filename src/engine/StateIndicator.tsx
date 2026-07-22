/**
 * Accessible top-corner indicator showing the current UserState.
 * Text-first (not icon only) per accessibility requirements.
 */
import { useAppState } from "./StateEngineContext";

const LABEL: Record<string, string> = {
  NORMAL: "Normal",
  REDUCED: "Reduced",
  SUPPORT: "Support",
  OFFLINE: "Offline",
};

export function StateIndicator({ className = "" }: { className?: string }) {
  const { currentState } = useAppState();
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`App state: ${LABEL[currentState]}`}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/40 border border-white/15 text-[11px] font-medium text-white/90 ${className}`}
    >
      <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-primary" />
      <span className="uppercase tracking-wide">{LABEL[currentState]}</span>
    </div>
  );
}
