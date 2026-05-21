// ── AI Interpreter Engine ──────────────────────────────────────────────────────
// Core coordinator for the voice-activated, visually-aware AI interpreter.
// Singleton that wires together voice, accessibility, AI, and automation.

import type {
  InterpreterConfig,
  InterpreterState,
  ParsedIntent,
  AIProvider,
  IntentCategory,
  DEFAULT_CONFIG,
} from '../types/interpreter.types';
import { DEFAULT_CONFIG as _DEFAULT_CONFIG } from '../types/interpreter.types';
import { AccessibilityController } from './AccessibilityController';
import { UIAutomationEngine } from './UIAutomationEngine';
import { VoiceCommandProcessor } from './VoiceCommandProcessor';
import { MultiAIOrchestrator } from '../providers/MultiAIOrchestrator';
import { NavigationWorkflow } from '../workflows/NavigationWorkflow';
import { ShoppingWorkflow } from '../workflows/ShoppingWorkflow';
import { CommunicationWorkflow } from '../workflows/CommunicationWorkflow';
import { DeviceControlWorkflow } from '../workflows/DeviceControlWorkflow';
import { nativeBridge } from '../native/NativeAccessibilityBridge';

type StateListener = (state: InterpreterState) => void;
type SpeakFn = (text: string) => Promise<void>;

export class AIInterpreterEngine {
  private static instance: AIInterpreterEngine | null = null;

  readonly accessibility: AccessibilityController;
  readonly automation: UIAutomationEngine;
  readonly voice: VoiceCommandProcessor;
  readonly ai: MultiAIOrchestrator;
  readonly navigation: NavigationWorkflow;
  readonly shopping: ShoppingWorkflow;
  readonly communication: CommunicationWorkflow;
  readonly deviceControl: DeviceControlWorkflow;

  private state: InterpreterState;
  private listeners: StateListener[] = [];
  private speakFn: SpeakFn | null = null;
  private lastResponse: string | null = null;
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  private cleanupFns: Array<() => void> = [];

  private constructor(config: InterpreterConfig) {
    this.state = {
      isActive: false,
      isListening: false,
      isProcessing: false,
      isSpeaking: false,
      currentIntent: null,
      currentWorkflow: null,
      lastResponse: null,
      config,
      error: null,
    };

    this.accessibility = new AccessibilityController();
    this.automation = new UIAutomationEngine(this.accessibility);
    this.ai = new MultiAIOrchestrator();
    this.voice = new VoiceCommandProcessor(config, this.ai);
    this.navigation = new NavigationWorkflow(this.accessibility, this.automation, this.ai);
    this.shopping = new ShoppingWorkflow(this.accessibility, this.automation, this.ai);
    this.communication = new CommunicationWorkflow(this.accessibility, this.automation, this.ai);
    this.deviceControl = new DeviceControlWorkflow(this.ai);

    this.wireVoiceProcessor();
    this.wireDynamicContent();
    this.initNativeBridge();
  }

  static getInstance(config?: InterpreterConfig): AIInterpreterEngine {
    if (!AIInterpreterEngine.instance) {
      AIInterpreterEngine.instance = new AIInterpreterEngine(config || _DEFAULT_CONFIG);
    }
    return AIInterpreterEngine.instance;
  }

  static reset(): void {
    AIInterpreterEngine.instance?.destroy();
    AIInterpreterEngine.instance = null;
  }

  // ── Activation ─────────────────────────────────────────────────────────────

  activate(): void {
    if (this.state.isActive) return;
    this.updateState({ isActive: true, error: null });
    this.voice.start();

    const greeting = `${this.state.config.name} is active. Say a command or "help" to get started.`;
    this.speak(greeting);
    this.accessibility.announce(greeting);
  }

  deactivate(): void {
    this.voice.stop();
    this.updateState({ isActive: false, isListening: false, isProcessing: false });
    this.accessibility.announce(`${this.state.config.name} deactivated.`);
  }

  // ── TTS Integration ────────────────────────────────────────────────────────

  setSpeakFunction(fn: SpeakFn): void {
    this.speakFn = fn;
  }

  private async speak(text: string): Promise<void> {
    if (!this.state.config.autoSpeak) return;
    this.updateState({ isSpeaking: true });
    try {
      if (this.speakFn) {
        await this.speakFn(text);
      } else {
        await this.browserSpeak(text);
      }
    } finally {
      this.updateState({ isSpeaking: false });
    }
  }

  private browserSpeak(text: string): Promise<void> {
    return new Promise(resolve => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.state.config.language || 'en-US';
      utterance.rate = 1.1;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }

  // ── Intent Dispatch ────────────────────────────────────────────────────────

  async handleIntent(intent: ParsedIntent): Promise<void> {
    this.updateState({ currentIntent: intent, isProcessing: true, error: null });

    try {
      const response = await this.dispatch(intent);
      this.lastResponse = response;
      this.updateState({ lastResponse: response, isProcessing: false });

      // Add to conversation history
      this.conversationHistory.push(
        { role: 'user', content: intent.rawText },
        { role: 'assistant', content: response }
      );
      // Keep last 20 exchanges
      if (this.conversationHistory.length > 40) {
        this.conversationHistory = this.conversationHistory.slice(-40);
      }

      await this.speak(response);
      this.accessibility.announce(response);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'An error occurred';
      this.updateState({ error: errMsg, isProcessing: false });
      await this.speak(`Error: ${errMsg}`);
    }
  }

  // Process a raw text command directly (for programmatic use)
  async processCommand(rawText: string): Promise<string> {
    const intent = await this.ai.parseIntent(rawText);
    await this.handleIntent({ ...intent, rawText });
    return this.lastResponse || '';
  }

  private async dispatch(intent: ParsedIntent): Promise<string> {
    const { category, target, value, query } = intent;

    switch (category) {
      case 'read_screen': {
        this.updateState({ currentWorkflow: 'screen-reader' });
        return this.navigation.readCurrentScreen();
      }

      case 'describe_visual': {
        this.updateState({ currentWorkflow: 'visual-description' });
        const screen = this.accessibility.getScreenState();
        const prompt = `Describe what a blind user needs to know about this screen.
Title: ${screen.title}
Content: ${screen.mainContent?.slice(0, 500)}
Be specific about colors, layout, and important details. Under 3 sentences.`;
        return this.ai.complete(prompt, 'describe_visual');
      }

      case 'click': {
        this.updateState({ currentWorkflow: 'ui-automation' });
        const result = await this.automation.execute({ type: 'click', target: target || '' });
        return result.message;
      }

      case 'fill_form': {
        this.updateState({ currentWorkflow: 'form-filling' });
        if (!target || !value) {
          return 'Please specify what to fill and where. Example: "Type John Smith into the name field"';
        }
        const result = await this.automation.execute({ type: 'type', target, value });
        return result.message;
      }

      case 'scroll': {
        const result = await this.navigation.scrollPage(value || 'down');
        return result.message;
      }

      case 'navigate': {
        this.updateState({ currentWorkflow: 'navigation' });
        if (!target) return 'Where would you like to go?';
        // Try native device navigation first (opens any phone app)
        if (nativeBridge.isNative) {
          const native = await this.deviceControl.openApp(target);
          if (native.success) return native.message;
        }
        const result = await this.navigation.navigateToApp(target);
        return result.success ? `Navigating to ${target}` : result.message;
      }

      case 'switch_app': {
        this.updateState({ currentWorkflow: 'navigation' });
        const appName = target || query || value;
        if (!appName) return 'Which app would you like to open?';
        if (nativeBridge.isNative) {
          return (await this.deviceControl.openApp(appName)).message;
        }
        return `On mobile: say "open ${appName}" after enabling the accessibility service.`;
      }


      case 'search': {
        this.updateState({ currentWorkflow: 'search' });
        const q = query || target || value;
        if (!q) return 'What would you like to search for?';
        const result = await this.shopping.searchForProduct(q);
        return result.message;
      }

      case 'shop': {
        this.updateState({ currentWorkflow: 'shopping' });
        const product = await this.shopping.identifyCurrentProduct();
        return this.shopping.describeProduct(product);
      }

      case 'checkout': {
        this.updateState({ currentWorkflow: 'checkout' });
        const result = await this.shopping.startCheckout();
        return result.message;
      }

      case 'call': {
        this.updateState({ currentWorkflow: 'calling' });
        if (!target) return 'Who would you like to call?';
        const result = await this.communication.initiateCall(target);
        return result.message;
      }

      case 'message': {
        this.updateState({ currentWorkflow: 'messaging' });
        if (!target) return 'Who would you like to message?';
        if (value) {
          const result = await this.communication.sendMessage(target, value);
          return result.message;
        }
        return `Ready to message ${target}. What should I say?`;
      }

      case 'switch_ai': {
        const provider = (value || target) as AIProvider;
        if (provider && ['claude', 'openai', 'google', 'auto'].includes(provider)) {
          this.ai.setPreferredProvider(provider);
          this.updateState({ config: { ...this.state.config, primaryAI: provider } });
          return `Switched to ${this.ai.getProviderDisplayName(provider)}`;
        }
        return 'Say "use Claude", "use ChatGPT", or "use Google" to switch AI assistants.';
      }

      case 'set_preference': {
        return this.handlePreference(intent);
      }

      case 'help': {
        return this.getHelpText();
      }

      case 'stop': {
        this.deactivate();
        return `${this.state.config.name} stopped. Say "activate Aria" to restart.`;
      }

      case 'repeat': {
        if (this.lastResponse) {
          return this.lastResponse;
        }
        return 'Nothing to repeat yet.';
      }

      default: {
        // Fallback to conversational AI with screen context
        this.updateState({ currentWorkflow: 'conversation' });
        const screen = this.accessibility.getScreenState();
        const context = `Current screen: ${screen.title}. ${screen.mainContent?.slice(0, 200) || ''}`;

        const messages = [
          ...this.conversationHistory.slice(-6),
          { role: 'user' as const, content: intent.rawText },
        ];

        const response = await this.ai.chat(messages, 'unknown', this.buildSystemPrompt(context));
        return response.content;
      }
    }
  }

  // ── Preference Handling ────────────────────────────────────────────────────

  private async handlePreference(intent: ParsedIntent): Promise<string> {
    const text = intent.rawText.toLowerCase();
    const config = { ...this.state.config };

    if (text.includes('turn off voice') || text.includes('stop speaking')) {
      config.autoSpeak = false;
      this.updateState({ config });
      return 'Voice responses turned off. I will still process commands silently.';
    }

    if (text.includes('turn on voice') || text.includes('start speaking')) {
      config.autoSpeak = true;
      this.updateState({ config });
      return 'Voice responses turned on.';
    }

    if (text.includes('screen reader mode')) {
      config.screenReaderMode = !config.screenReaderMode;
      this.updateState({ config });
      return `Screen reader mode ${config.screenReaderMode ? 'enabled' : 'disabled'}.`;
    }

    const nameMatch = text.match(/call you (\w+)/i);
    if (nameMatch) {
      config.name = nameMatch[1];
      this.updateState({ config });
      return `I'll respond to ${nameMatch[1]} from now on.`;
    }

    return 'Preference updated. Say "help" to see available settings.';
  }

  // ── System Prompt ──────────────────────────────────────────────────────────

  private buildSystemPrompt(screenContext: string): string {
    return `You are ${this.state.config.name}, a voice-activated AI interpreter for a blind user.

Current screen context: ${screenContext}

Guidelines:
- Be concise — responses should be speakable in under 10 seconds
- Describe UI elements using position and role (e.g. "top button", "text field labeled Name")
- Never use visual metaphors like "you can see" or "as shown below"
- Confirm before taking irreversible actions (purchases, calls, deletions)
- If you don't know something on the screen, say so clearly
- Use the user's name if you know it`;
  }

  // ── Help Text ──────────────────────────────────────────────────────────────

  private getHelpText(): string {
    return `I'm ${this.state.config.name}, your AI interpreter. Here's what I can do:
Read screen: "What's on the screen?"
Click things: "Click the submit button"
Fill forms: "Type John into the name field"
Shop: "What product is this?" or "Add to cart"
Call: "Call Mom"
Message: "Text Sarah: I'll be late"
Navigate: "Go to settings"
Switch AI: "Use Claude" or "Use ChatGPT"
Say "stop" to deactivate.`;
  }

  // ── Native Bridge Init ─────────────────────────────────────────────────────

  private async initNativeBridge(): Promise<void> {
    const ready = await nativeBridge.init();
    if (ready) {
      const unsub = nativeBridge.onScreenChange((content) => {
        // When user switches to another app, optionally announce it
        if (this.state.config.screenReaderMode) {
          const summary = `Now in ${content.appName}. ${content.elements.length} elements.`;
          this.accessibility.announce(summary);
        }
      });
      this.cleanupFns.push(unsub);
    } else {
      // Check if we should prompt user to enable the service
      const { instructions } = await this.deviceControl.checkSetup();
      if (instructions.includes('Settings')) {
        console.info('[Interpreter] Native accessibility service not enabled:', instructions);
      }
    }
  }

  // ── Wiring ─────────────────────────────────────────────────────────────────

  private wireVoiceProcessor(): void {
    const unsubIntent = this.voice.onIntent((intent) => {
      this.handleIntent(intent);
    });

    const unsubStatus = this.voice.onStatus((status) => {
      this.updateState({
        isListening: status === 'listening',
        isProcessing: status === 'processing',
      });
    });

    this.cleanupFns.push(unsubIntent, unsubStatus);
  }

  private wireDynamicContent(): void {
    const unsub = this.accessibility.onDynamicContent((text) => {
      if (this.state.config.screenReaderMode && text) {
        this.speak(text);
      }
    });
    this.cleanupFns.push(unsub);
  }

  // ── State Management ───────────────────────────────────────────────────────

  private updateState(partial: Partial<InterpreterState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach(l => l(this.state));
  }

  getState(): InterpreterState {
    return { ...this.state };
  }

  onStateChange(listener: StateListener): () => void {
    this.listeners.push(listener);
    listener(this.state); // immediate snapshot
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  updateConfig(config: Partial<InterpreterConfig>): void {
    const newConfig = { ...this.state.config, ...config };
    this.updateState({ config: newConfig });
    this.voice.updateConfig(newConfig);
    if (config.primaryAI) {
      this.ai.setPreferredProvider(config.primaryAI);
    }
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────

  destroy(): void {
    this.voice.stop();
    this.accessibility.destroy();
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
    this.listeners = [];
  }
}
