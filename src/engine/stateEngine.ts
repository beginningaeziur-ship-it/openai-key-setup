/**
 * AEZUIR State Engine — Single Source of Truth
 *
 * Central brain that tracks the user's operational state and exposes
 * UI configuration derived from it. All rooms/features should read
 * from this engine instead of making their own decisions.
 *
 * Storage: localStorage key "sai_state"
 * States:  NORMAL | REDUCED | SUPPORT | OFFLINE
 */

export type UserState = "NORMAL" | "REDUCED" | "SUPPORT" | "OFFLINE";

export interface UIConfig {
  maxChoices: number;
  fontSize: "base" | "lg" | "xl";
  toneMode: "warm" | "calm" | "grounding" | "offline";
  sosVisible: boolean;
}

export const STATE_STORAGE_KEY = "sai_state";

export const STATE_ORDER: UserState[] = ["NORMAL", "REDUCED", "SUPPORT", "OFFLINE"];

const UI_CONFIG: Record<UserState, UIConfig> = {
  NORMAL:  { maxChoices: 6, fontSize: "base", toneMode: "warm",      sosVisible: true },
  REDUCED: { maxChoices: 3, fontSize: "lg",   toneMode: "calm",      sosVisible: true },
  SUPPORT: { maxChoices: 2, fontSize: "xl",   toneMode: "grounding", sosVisible: true },
  OFFLINE: { maxChoices: 2, fontSize: "xl",   toneMode: "offline",   sosVisible: true },
};

export function getUIConfigFor(state: UserState): UIConfig {
  return UI_CONFIG[state];
}

function isValidState(v: unknown): v is UserState {
  return v === "NORMAL" || v === "REDUCED" || v === "SUPPORT" || v === "OFFLINE";
}

type Listener = (state: UserState) => void;

class StateEngineImpl {
  private state: UserState = "NORMAL";
  private manualState: UserState | null = null;
  private listeners = new Set<Listener>();
  private initialized = false;

  init() {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;

    try {
      const stored = window.localStorage.getItem(STATE_STORAGE_KEY);
      if (isValidState(stored)) {
        this.manualState = stored;
        this.state = stored;
      }
    } catch {
      // ignore storage errors
    }

    // Offline takes precedence
    if (!window.navigator.onLine) {
      this.state = "OFFLINE";
    }

    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);
  }

  private handleOnline = () => {
    this.state = this.manualState ?? "NORMAL";
    this.emit();
  };

  private handleOffline = () => {
    this.state = "OFFLINE";
    this.emit();
  };

  private emit() {
    for (const l of this.listeners) l(this.state);
  }

  get currentState(): UserState {
    return this.state;
  }

  getUIConfig(): UIConfig {
    return getUIConfigFor(this.state);
  }

  setManualState(next: UserState) {
    this.manualState = next === "OFFLINE" ? null : next;
    try {
      if (next === "OFFLINE") {
        window.localStorage.removeItem(STATE_STORAGE_KEY);
      } else {
        window.localStorage.setItem(STATE_STORAGE_KEY, next);
      }
    } catch {
      // ignore
    }

    // Offline connectivity overrides manual choice
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      this.state = "OFFLINE";
    } else {
      this.state = next;
    }
    this.emit();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const stateEngine = new StateEngineImpl();
if (typeof window !== "undefined") stateEngine.init();
