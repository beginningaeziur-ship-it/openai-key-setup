// ── AI Interpreter Engine — Shared Types ──────────────────────────────────────

export type AIProvider = 'claude' | 'openai' | 'google' | 'auto';

export type IntentCategory =
  | 'navigate'
  | 'click'
  | 'fill_form'
  | 'read_screen'
  | 'describe_visual'
  | 'shop'
  | 'checkout'
  | 'call'
  | 'message'
  | 'scroll'
  | 'search'
  | 'switch_app'
  | 'set_preference'
  | 'switch_ai'
  | 'help'
  | 'stop'
  | 'repeat'
  | 'unknown';

export interface ParsedIntent {
  category: IntentCategory;
  rawText: string;
  target?: string;
  value?: string;
  query?: string;
  aiProvider?: AIProvider;
  confidence: number;
  params: Record<string, string>;
}

export type AutomationActionType =
  | 'click'
  | 'type'
  | 'clear'
  | 'select'
  | 'scroll'
  | 'focus'
  | 'wait'
  | 'navigate'
  | 'read';

export interface AutomationAction {
  type: AutomationActionType;
  target?: string;
  value?: string;
  delay?: number;
  description?: string;
}

export interface AutomationResult {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface ScreenElement {
  role: string;
  label: string;
  value?: string;
  description?: string;
  interactive: boolean;
  visible: boolean;
  selector?: string;
  tagName?: string;
  position?: { x: number; y: number; width: number; height: number };
}

export interface ScreenState {
  title: string;
  url?: string;
  focusedElement?: ScreenElement;
  interactiveElements: ScreenElement[];
  headings: string[];
  mainContent?: string;
  alerts: string[];
  landmark?: string;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  usage?: { inputTokens: number; outputTokens: number };
}

export interface InterpreterConfig {
  primaryAI: AIProvider;
  voiceEnabled: boolean;
  autoSpeak: boolean;
  language: string;
  name: string;
  personality: 'friendly' | 'professional' | 'casual';
  screenReaderMode: boolean;
}

export interface InterpreterState {
  isActive: boolean;
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  currentIntent: ParsedIntent | null;
  currentWorkflow: string | null;
  lastResponse: string | null;
  config: InterpreterConfig;
  error: string | null;
}

export type InterpreterEventType =
  | 'state-change'
  | 'intent-detected'
  | 'response-ready'
  | 'automation-start'
  | 'automation-complete'
  | 'automation-error'
  | 'screen-read'
  | 'error';

export interface InterpreterEvent {
  type: InterpreterEventType;
  data?: unknown;
  timestamp: number;
}

export interface ShoppingProduct {
  name: string;
  price?: string;
  description?: string;
  expirationDate?: string;
  color?: string;
  brand?: string;
  inStock?: boolean;
  url?: string;
}

export interface ShoppingCart {
  items: ShoppingProduct[];
  total?: string;
  store?: string;
}

export interface ContactInfo {
  name: string;
  phoneNumber?: string;
  email?: string;
}

export const DEFAULT_CONFIG: InterpreterConfig = {
  primaryAI: 'auto',
  voiceEnabled: true,
  autoSpeak: true,
  language: 'en-US',
  name: 'Aria',
  personality: 'friendly',
  screenReaderMode: true,
};
