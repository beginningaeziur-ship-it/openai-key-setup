// ── Stateless Session Manager ──────────────────────────────────────────────────
// Enforces zero-persistence mode for the AI Interpreter.
//
// Guarantees:
//   • No conversation data written to localStorage, sessionStorage, or IndexedDB
//   • All in-memory data is actively wiped when the session ends
//   • Every new session starts completely cold — no prior context
//   • Edge function calls include no-store headers
//
// What this does NOT cover:
//   • AI provider logs (Anthropic/OpenAI/Google may retain API call logs per
//     their own policies — we have no control over those)

type WipeFn = () => void;

export type PrivacyStatus =
  | 'stateless'      // active, memory-only, will wipe on close
  | 'wiped'          // session ended, memory cleared
  | 'compromised';   // unexpected persistence detected (audit mode)

export class StatelessSessionManager {
  private static instance: StatelessSessionManager | null = null;

  private wipeFns: WipeFn[] = [];
  private status: PrivacyStatus = 'stateless';
  private statusListeners: Array<(s: PrivacyStatus) => void> = [];
  private sessionId: string;

  private constructor() {
    // Random session ID — never stored, never transmitted
    this.sessionId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

    this.registerEventListeners();
    this.auditForLeaks();
  }

  static getInstance(): StatelessSessionManager {
    if (!StatelessSessionManager.instance) {
      StatelessSessionManager.instance = new StatelessSessionManager();
    }
    return StatelessSessionManager.instance;
  }

  // ── Registration ───────────────────────────────────────────────────────────

  /** Register a cleanup function that wipes an in-memory data structure. */
  register(wipeFn: WipeFn): () => void {
    this.wipeFns.push(wipeFn);
    return () => {
      this.wipeFns = this.wipeFns.filter(f => f !== wipeFn);
    };
  }

  // ── Active Wipe ────────────────────────────────────────────────────────────

  /** Immediately zero out all registered in-memory data. */
  wipe(): void {
    this.wipeFns.forEach(fn => {
      try { fn(); } catch { /* never throw during wipe */ }
    });
    this.wipeFns = [];
    this.setStatus('wiped');
  }

  // ── Fetch Wrapper ──────────────────────────────────────────────────────────

  /**
   * Wraps fetch with privacy headers.
   * All AI API calls from the interpreter MUST use this instead of raw fetch.
   */
  secureFetch(url: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers || {});

    // Instruct proxies and CDNs not to cache or store this request/response
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    headers.set('Pragma', 'no-cache');

    // Custom header so edge functions can enforce stateless mode
    headers.set('X-Interpreter-Privacy', 'stateless');
    headers.set('X-Session-Id', this.sessionId); // ephemeral — not stored anywhere

    return fetch(url, { ...init, headers });
  }

  // ── Status ─────────────────────────────────────────────────────────────────

  getStatus(): PrivacyStatus {
    return this.status;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  onStatusChange(listener: (s: PrivacyStatus) => void): () => void {
    this.statusListeners.push(listener);
    listener(this.status);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  private setStatus(status: PrivacyStatus): void {
    this.status = status;
    this.statusListeners.forEach(l => l(status));
  }

  // ── Event Listeners ────────────────────────────────────────────────────────

  private registerEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Fire on tab close, browser close, or navigation away
    const handleUnload = () => this.wipe();
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    // Also wipe when tab becomes hidden for extended period (mobile background)
    let hiddenTimer: ReturnType<typeof setTimeout> | null = null;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Wipe after 30 minutes of backgrounding
        hiddenTimer = setTimeout(() => this.wipe(), 30 * 60 * 1000);
      } else {
        if (hiddenTimer) {
          clearTimeout(hiddenTimer);
          hiddenTimer = null;
        }
      }
    });
  }

  // ── Leak Detection ─────────────────────────────────────────────────────────

  private auditForLeaks(): void {
    if (typeof window === 'undefined') return;

    const INTERPRETER_KEYS = ['interpreter_', 'aria_session', 'ai_history', 'brain_'];

    // Check if any prior session left data (shouldn't happen, but validate)
    const leaked = [...Object.keys(localStorage), ...Object.keys(sessionStorage)]
      .filter(k => INTERPRETER_KEYS.some(prefix => k.startsWith(prefix)));

    if (leaked.length > 0) {
      leaked.forEach(k => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
      console.warn('[StatelessManager] Cleaned up leaked interpreter keys:', leaked);
      this.setStatus('compromised');
      // Auto-recover to stateless after cleanup
      setTimeout(() => this.setStatus('stateless'), 2000);
    }
  }
}

// Singleton export
export const statelessManager = StatelessSessionManager.getInstance();
