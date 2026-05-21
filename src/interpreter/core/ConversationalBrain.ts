// ── Conversational Brain ───────────────────────────────────────────────────────
// Every word the user hears passes through here.
// Turns raw action results into natural, warm, spoken responses —
// like a sighted friend describing and operating the phone for them.

import type { AIMessage, AIProvider, IntentCategory, ScreenState } from '../types/interpreter.types';
import type { MultiAIOrchestrator } from '../providers/MultiAIOrchestrator';
import { statelessManager } from './StatelessSessionManager';

export interface BrainConfig {
  name: string;                       // e.g. "Aria"
  primaryAI: AIProvider;
  personality: 'friendly' | 'professional' | 'casual';
}

export class ConversationalBrain {
  private history: AIMessage[] = [];
  private lastScreenDescription = '';

  constructor(
    private ai: MultiAIOrchestrator,
    private config: BrainConfig
  ) {
    // Register with the stateless manager so history is wiped on session end
    statelessManager.register(() => this.wipe());
  }

  updateConfig(config: Partial<BrainConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ── Core narration: make any action result sound like natural speech ────────

  async narrate(actionResult: string, taskType: IntentCategory): Promise<string> {
    // Simple confirmations don't need an AI round-trip — just humanize them
    const quick = this.quickNarrate(actionResult, taskType);
    if (quick) return quick;

    // Complex results: pass through the AI brain for natural language
    const prompt = buildNarrationPrompt(actionResult, taskType);
    try {
      const response = await this.ai.chat(
        [{ role: 'user', content: prompt }],
        taskType,
        this.systemPrompt()
      );
      return response.content;
    } catch {
      return actionResult; // fallback to raw if AI is unavailable
    }
  }

  // ── Screen description: paint a picture of what's on screen ───────────────

  async describeScreen(state: ScreenState): Promise<string> {
    const elements = state.interactiveElements
      .slice(0, 12)
      .map(e => e.isInteractive ? `a "${e.label}" button` : e.label)
      .join(', ');

    const prompt = `Describe this screen to a blind user as a helpful sighted friend would.

App/Page: ${state.title}
URL: ${state.url || 'n/a'}
Main content: ${state.mainContent?.slice(0, 400) || 'none'}
Interactive elements: ${elements || 'none found'}
${state.headings.length ? `Headings: ${state.headings.slice(0, 4).join(', ')}` : ''}
${state.alerts.length ? `Alerts on screen: ${state.alerts.join(', ')}` : ''}

In 2–3 sentences, describe what the user is looking at and what they can do from here.
Be conversational — no bullet points, no lists. Just natural spoken language.
If there is something immediately useful or actionable, mention it.`;

    try {
      const response = await this.ai.chat(
        [{ role: 'user', content: prompt }],
        'read_screen',
        this.systemPrompt()
      );
      this.lastScreenDescription = response.content;
      return response.content;
    } catch {
      return this.fallbackScreenDescription(state);
    }
  }

  // ── Conversational chat: the main back-and-forth AI dialogue ──────────────

  async chat(userMessage: string, screenContext?: string): Promise<string> {
    const contextNote = screenContext
      ? `[Current screen: ${screenContext.slice(0, 200)}]`
      : '';

    this.history.push({
      role: 'user',
      content: contextNote ? `${contextNote}\n\n${userMessage}` : userMessage,
    });

    // Keep last 10 exchanges in history
    if (this.history.length > 20) {
      this.history = this.history.slice(-20);
    }

    try {
      const response = await this.ai.chat(
        this.history,
        'unknown',
        this.systemPrompt()
      );
      this.history.push({ role: 'assistant', content: response.content });
      return response.content;
    } catch (err) {
      const msg = 'I had trouble connecting right now. Please try again in a moment.';
      this.history.push({ role: 'assistant', content: msg });
      return msg;
    }
  }

  // ── Help text: sounds like a real assistant explaining itself ─────────────

  getHelpText(): string {
    const aiName = this.ai.getProviderDisplayName(this.config.primaryAI);
    return `Hi, I'm ${this.config.name}, powered by ${aiName}. Here's what I can do for you:

Say "read the screen" and I'll describe exactly what's in front of you.
Say "click the search button" and I'll tap it.
Say "type hello into the message box" and I'll type it.
Say "open Instagram" or any app name and I'll launch it.
Say "call Mom" or "text Sarah: I'm on my way" for calls and messages.
Say "what product is this" when shopping and I'll read the name, price, and details.
Say "use Claude" or "use ChatGPT" or "use Gemini" to change which AI is talking to you.
Say "stop" when you want me to go quiet.

What would you like to do?`;
  }

  /** Wipe all in-memory conversation data. Called by StatelessSessionManager on session end. */
  wipe(): void {
    // Overwrite before clearing so GC cannot read residual values
    this.history.forEach(m => { m.content = ''; });
    this.history = [];
    this.lastScreenDescription = '';
  }

  clearHistory(): void {
    this.wipe();
  }

  // ── System prompt: the "personality" injected into every AI call ───────────

  systemPrompt(): string {
    const aiName = this.ai.getProviderDisplayName(this.config.primaryAI);

    const toneGuide = {
      friendly:     'Warm, upbeat, encouraging. Like a helpful best friend.',
      professional: 'Clear, calm, efficient. Like a professional assistant.',
      casual:       'Relaxed, informal, easygoing. Like texting a friend.',
    }[this.config.personality];

    return `You are ${this.config.name}, a voice-activated AI assistant for a blind user, powered by ${aiName}.

PERSONALITY: ${toneGuide}

YOUR JOB:
You are the eyes and hands for someone who cannot see or use their screen. You describe what's on it, operate it for them, and keep them informed in real time.

HOW TO SPEAK:
- Always use natural, conversational spoken language — no bullet points, no markdown, no lists
- Every response will be read aloud, so write as you would speak
- Be specific: say "the blue Add to Cart button" not "a button"
- Confirm actions warmly: "Done, I tapped that for you" not "ACTION_COMPLETE"
- When describing screens, paint a picture: "You're on the Amazon product page for a pair of headphones..."
- Suggest what to do next when it's helpful
- If something goes wrong, explain it simply and offer an alternative

WHAT YOU CAN DO:
- Read and describe any screen on the phone
- Tap buttons, fill in forms, scroll pages
- Open any installed app
- Make calls and send messages
- Find products, read prices, colors, expiration dates, complete checkouts
- Answer questions about anything

WHAT YOU NEVER DO:
- Never say "I cannot see the screen" — you can see everything
- Never use technical jargon like "DOM element" or "CSS selector"
- Never give a list when a sentence will do
- Never leave the user uncertain about what just happened

Keep every response under 30 seconds when spoken aloud.`;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  // Fast, no-AI humanization for simple confirmations
  private quickNarrate(result: string, taskType: IntentCategory): string | null {
    const r = result.toLowerCase();

    if (taskType === 'click') {
      if (r.includes('clicked:') || r.includes('clicked ')) {
        const what = result.replace(/^clicked:?\s*/i, '').trim();
        return `Done — I tapped ${what} for you.`;
      }
      if (r.includes('not found') || r.includes('could not find')) {
        return `I couldn't find that button on the screen. Try saying "read the screen" to hear what's available.`;
      }
    }

    if (taskType === 'scroll') {
      if (r.includes('scrolled')) {
        const dir = r.includes('down') ? 'down' : r.includes('up') ? 'up' : '';
        return `Scrolled ${dir}. Say "read the screen" to hear what's visible now.`;
      }
    }

    if (taskType === 'fill_form') {
      if (r.includes('typed')) {
        return `Got it — I filled that in for you.`;
      }
    }

    if (taskType === 'stop') {
      return null; // let the engine handle this one
    }

    return null; // needs AI narration
  }

  private fallbackScreenDescription(state: ScreenState): string {
    const parts: string[] = [];
    parts.push(`You're on ${state.title || 'a page'}.`);
    if (state.headings.length) parts.push(`I can see ${state.headings[0]}.`);
    const count = state.interactiveElements.length;
    if (count > 0) {
      const first = state.interactiveElements.slice(0, 3).map(e => e.label).join(', ');
      parts.push(`There are ${count} things you can interact with, including ${first}.`);
    }
    return parts.join(' ');
  }
}

// ── Prompt builder ─────────────────────────────────────────────────────────────

function buildNarrationPrompt(actionResult: string, taskType: IntentCategory): string {
  const contextMap: Partial<Record<IntentCategory, string>> = {
    shop:     'The user asked about a product.',
    checkout: 'The user was checking out.',
    call:     'The user was making a phone call.',
    message:  'The user was sending a message.',
    navigate: 'The user was navigating somewhere.',
    search:   'The user was searching for something.',
  };

  const context = contextMap[taskType] || 'The user gave a voice command.';

  return `${context}

The result was: "${actionResult}"

Tell the user what happened in 1–2 natural spoken sentences.
Be warm and clear. Write exactly what should be spoken aloud.`;
}
