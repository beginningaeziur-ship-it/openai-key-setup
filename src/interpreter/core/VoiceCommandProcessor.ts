// ── Voice Command Processor ────────────────────────────────────────────────────
// Continuous speech-to-intent pipeline using Web Speech API + AI parsing.
// Supports wake words, command confirmation, and noise filtering.

import type { ParsedIntent, InterpreterConfig } from '../types/interpreter.types';
import { MultiAIOrchestrator } from '../providers/MultiAIOrchestrator';

type TranscriptCallback = (intent: ParsedIntent, rawText: string) => void;
type StatusCallback = (status: 'listening' | 'processing' | 'idle' | 'error', detail?: string) => void;

// Minimal SpeechRecognition interface (browser built-in, not in all TS libs)
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

export class VoiceCommandProcessor {
  private recognition: SpeechRecognitionInstance | null = null;
  private isListening = false;
  private intentCallbacks: TranscriptCallback[] = [];
  private statusCallbacks: StatusCallback[] = [];
  private interimCallbacks: Array<(text: string) => void> = [];
  private config: InterpreterConfig;
  private ai: MultiAIOrchestrator;
  private restartTimer: ReturnType<typeof setTimeout> | null = null;
  private wakeWords = ['aria', 'hey aria', 'okay aria'];
  private awake = false;
  private wakeWordMode = false;

  constructor(config: InterpreterConfig, ai: MultiAIOrchestrator) {
    this.config = config;
    this.ai = ai;
  }

  get isSupported(): boolean {
    return typeof window !== 'undefined' &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  setWakeWordMode(enabled: boolean): void {
    this.wakeWordMode = enabled;
    if (!enabled) this.awake = true; // always awake in push-to-talk mode
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  start(): void {
    if (!this.isSupported || this.isListening) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    this.recognition = new SR();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.config.language || 'en-US';
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.notifyStatus('listening');
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.handleResult(event);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      this.notifyStatus('error', event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      // Auto-restart for continuous listening
      if (this.config.voiceEnabled) {
        this.restartTimer = setTimeout(() => this.start(), 500);
      }
    };

    try {
      this.recognition.start();
    } catch {
      this.notifyStatus('error', 'Could not start voice recognition');
    }
  }

  stop(): void {
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    if (this.recognition) {
      this.recognition.abort();
      this.recognition = null;
    }
    this.isListening = false;
    this.notifyStatus('idle');
  }

  // Single-shot listen (push-to-talk)
  listenOnce(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { reject(new Error('No SR')); return; }

      const recognition = new SR();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = this.config.language || 'en-US';

      let resolved = false;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0]?.[0]?.transcript?.trim() || '';
        if (!resolved && transcript) {
          resolved = true;
          resolve(transcript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (!resolved) reject(new Error(event.error));
      };

      recognition.onend = () => {
        if (!resolved) resolve('');
      };

      recognition.start();

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          recognition.abort();
          resolve('');
        }
      }, 10000);
    });
  }

  // ── Result Handling ────────────────────────────────────────────────────────

  private async handleResult(event: SpeechRecognitionEvent): Promise<void> {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const text = result[0].transcript;
      if (result.isFinal) {
        finalTranscript += text;
      } else {
        interimTranscript += text;
      }
    }

    // Notify interim results for UI display
    if (interimTranscript) {
      this.interimCallbacks.forEach(cb => cb(interimTranscript));
    }

    if (!finalTranscript.trim()) return;

    // Wake word check
    if (this.wakeWordMode && !this.awake) {
      if (this.containsWakeWord(finalTranscript)) {
        this.awake = true;
        this.notifyStatus('listening', 'awake');
        return;
      }
      return;
    }

    // Process command
    this.notifyStatus('processing');
    await this.processCommand(finalTranscript.trim());
  }

  private containsWakeWord(text: string): boolean {
    const lower = text.toLowerCase();
    return this.wakeWords.some(w => lower.includes(w));
  }

  private async processCommand(rawText: string): Promise<void> {
    try {
      const parsed = await this.ai.parseIntent(rawText);
      const intent: ParsedIntent = {
        ...parsed,
        rawText,
      };

      this.intentCallbacks.forEach(cb => cb(intent, rawText));
      this.notifyStatus('listening');
    } catch (err) {
      this.notifyStatus('error', err instanceof Error ? err.message : 'Parse failed');
    }
  }

  // ── Event Subscriptions ────────────────────────────────────────────────────

  onIntent(callback: TranscriptCallback): () => void {
    this.intentCallbacks.push(callback);
    return () => {
      this.intentCallbacks = this.intentCallbacks.filter(cb => cb !== callback);
    };
  }

  onStatus(callback: StatusCallback): () => void {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }

  onInterim(callback: (text: string) => void): () => void {
    this.interimCallbacks.push(callback);
    return () => {
      this.interimCallbacks = this.interimCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyStatus(status: 'listening' | 'processing' | 'idle' | 'error', detail?: string): void {
    this.statusCallbacks.forEach(cb => cb(status, detail));
  }

  updateConfig(config: Partial<InterpreterConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
