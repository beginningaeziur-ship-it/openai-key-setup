// ── Multi-AI Orchestrator ──────────────────────────────────────────────────────
// Routes tasks to the best AI provider, with fallback chains.
// User can set a preferred provider or use "auto" for smart routing.

import type { AIMessage, AIProvider, AIResponse, IntentCategory } from '../types/interpreter.types';
import { ClaudeProvider } from './ClaudeProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { GoogleAIProvider } from './GoogleAIProvider';

// Maps task categories to preferred providers
const ROUTING_TABLE: Record<IntentCategory, AIProvider[]> = {
  describe_visual: ['claude', 'openai', 'google'],
  read_screen:     ['claude', 'google', 'openai'],
  navigate:        ['claude', 'google', 'openai'],
  shop:            ['claude', 'openai', 'google'],
  checkout:        ['openai', 'claude', 'google'],
  fill_form:       ['openai', 'claude', 'google'],
  call:            ['openai', 'claude', 'google'],
  message:         ['openai', 'claude', 'google'],
  search:          ['google', 'openai', 'claude'],
  click:           ['google', 'claude', 'openai'],
  scroll:          ['google', 'claude', 'openai'],
  switch_app:      ['google', 'claude', 'openai'],
  set_preference:  ['google', 'claude', 'openai'],
  switch_ai:       ['google', 'claude', 'openai'],
  help:            ['claude', 'google', 'openai'],
  stop:            ['google', 'claude', 'openai'],
  repeat:          ['google', 'claude', 'openai'],
  unknown:         ['google', 'claude', 'openai'],
};

export class MultiAIOrchestrator {
  private claude = new ClaudeProvider();
  private openai = new OpenAIProvider();
  private google = new GoogleAIProvider();
  private preferredProvider: AIProvider = 'auto';

  setPreferredProvider(provider: AIProvider): void {
    this.preferredProvider = provider;
  }

  getPreferredProvider(): AIProvider {
    return this.preferredProvider;
  }

  getProviderDisplayName(provider: AIProvider): string {
    switch (provider) {
      case 'claude': return this.claude.displayName;
      case 'openai': return this.openai.displayName;
      case 'google': return this.google.displayName;
      default:       return 'Auto (Smart Routing)';
    }
  }

  async chat(
    messages: AIMessage[],
    taskType: IntentCategory = 'unknown',
    systemPrompt?: string
  ): Promise<AIResponse> {
    const order = this.getProviderOrder(taskType);

    for (const providerName of order) {
      try {
        return await this.callProvider(providerName, messages, systemPrompt);
      } catch (err) {
        console.warn(`[MultiAI] ${providerName} failed, trying next:`, err);
      }
    }

    throw new Error('All AI providers failed. Please check your connection.');
  }

  async complete(
    prompt: string,
    taskType: IntentCategory = 'unknown',
    context?: string
  ): Promise<string> {
    const messages: AIMessage[] = [
      { role: 'user', content: context ? `${context}\n\n${prompt}` : prompt },
    ];
    const response = await this.chat(messages, taskType);
    return response.content;
  }

  private getProviderOrder(taskType: IntentCategory): AIProvider[] {
    if (this.preferredProvider !== 'auto') {
      const rest = (ROUTING_TABLE[taskType] || ['google', 'claude', 'openai'])
        .filter(p => p !== this.preferredProvider) as AIProvider[];
      return [this.preferredProvider, ...rest];
    }
    return ROUTING_TABLE[taskType] || ['google', 'claude', 'openai'];
  }

  private async callProvider(
    provider: AIProvider,
    messages: AIMessage[],
    systemPrompt?: string
  ): Promise<AIResponse> {
    switch (provider) {
      case 'claude': return this.claude.chat(messages, systemPrompt);
      case 'openai': return this.openai.chat(messages, systemPrompt);
      case 'google': return this.google.chat(messages, systemPrompt);
      default:       return this.google.chat(messages, systemPrompt);
    }
  }

  // Parse natural-language commands into structured intents using AI
  async parseIntent(rawText: string): Promise<{
    category: IntentCategory;
    target?: string;
    value?: string;
    query?: string;
    confidence: number;
    params: Record<string, string>;
  }> {
    const prompt = `Parse this voice command from a blind user into a structured intent.

Command: "${rawText}"

Respond with JSON only (no markdown):
{
  "category": one of [navigate, click, fill_form, read_screen, describe_visual, shop, checkout, call, message, scroll, search, switch_app, set_preference, switch_ai, help, stop, repeat, unknown],
  "target": "the element to interact with (if any)",
  "value": "the value to type or select (if any)",
  "query": "search query (if any)",
  "confidence": 0.0-1.0,
  "params": {}
}`;

    try {
      const result = await this.complete(prompt, 'unknown');
      const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        category: parsed.category || 'unknown',
        target: parsed.target,
        value: parsed.value,
        query: parsed.query,
        confidence: parsed.confidence ?? 0.7,
        params: parsed.params || {},
      };
    } catch {
      return this.fallbackParse(rawText);
    }
  }

  private fallbackParse(rawText: string): {
    category: IntentCategory;
    target?: string;
    value?: string;
    query?: string;
    confidence: number;
    params: Record<string, string>;
  } {
    const text = rawText.toLowerCase().trim();

    if (/^(stop|cancel|quit|exit|never mind)/i.test(text)) {
      return { category: 'stop', confidence: 0.95, params: {} };
    }
    if (/^(read|what('s| is) (on|the) (screen|page)|describe (the )?(screen|page))/i.test(text)) {
      return { category: 'read_screen', confidence: 0.9, params: {} };
    }
    if (/^(click|press|tap|select|choose) /i.test(text)) {
      const target = text.replace(/^(click|press|tap|select|choose) /i, '').trim();
      return { category: 'click', target, confidence: 0.85, params: {} };
    }
    if (/^(type|enter|write|fill in|input) /i.test(text)) {
      const parts = text.match(/^(?:type|enter|write|fill in|input) (.+?) (?:in(?:to)?|into) (.+)$/i);
      if (parts) {
        return { category: 'fill_form', value: parts[1], target: parts[2], confidence: 0.8, params: {} };
      }
      return { category: 'fill_form', value: text.replace(/^(type|enter|write|fill in|input) /i, ''), confidence: 0.7, params: {} };
    }
    if (/^(scroll|swipe) (down|up|left|right|top|bottom)/i.test(text)) {
      const match = text.match(/(down|up|left|right|top|bottom)/i);
      return { category: 'scroll', value: match?.[1] || 'down', confidence: 0.9, params: {} };
    }
    if (/^(search|find|look for) /i.test(text)) {
      const query = text.replace(/^(search|find|look for) /i, '').trim();
      return { category: 'search', query, confidence: 0.85, params: {} };
    }
    if (/^(go to|navigate to|open) /i.test(text)) {
      const target = text.replace(/^(go to|navigate to|open) /i, '').trim();
      return { category: 'navigate', target, confidence: 0.85, params: {} };
    }
    if (/^(call|phone|dial) /i.test(text)) {
      const target = text.replace(/^(call|phone|dial) /i, '').trim();
      return { category: 'call', target, confidence: 0.85, params: {} };
    }
    if (/^(message|text|send) /i.test(text)) {
      const target = text.replace(/^(message|text|send) /i, '').trim();
      return { category: 'message', target, confidence: 0.8, params: {} };
    }
    if (/^(buy|purchase|add to cart|shop for) /i.test(text)) {
      const query = text.replace(/^(buy|purchase|add to cart|shop for) /i, '').trim();
      return { category: 'shop', query, confidence: 0.85, params: {} };
    }
    if (/^(checkout|place order|complete (my )?order)/i.test(text)) {
      return { category: 'checkout', confidence: 0.9, params: {} };
    }
    if (/^(use|switch to|change to) (claude|anthropic|openai|chatgpt|google|gemini)/i.test(text)) {
      const match = text.match(/(claude|openai|chatgpt|google|gemini)/i);
      let ai: AIProvider = 'auto';
      if (match?.[1]) {
        const m = match[1].toLowerCase();
        if (m === 'claude' || m === 'anthropic') ai = 'claude';
        else if (m === 'openai' || m === 'chatgpt') ai = 'openai';
        else if (m === 'google' || m === 'gemini') ai = 'google';
      }
      return { category: 'switch_ai', value: ai, confidence: 0.95, params: {} };
    }
    if (/^(help|what can you do|how do i)/i.test(text)) {
      return { category: 'help', confidence: 0.9, params: {} };
    }
    if (/^(repeat|say that again|again)/i.test(text)) {
      return { category: 'repeat', confidence: 0.95, params: {} };
    }

    return { category: 'unknown', confidence: 0.3, params: {} };
  }
}
