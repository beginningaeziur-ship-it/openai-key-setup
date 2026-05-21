// ── OpenAI Provider ────────────────────────────────────────────────────────────
// Calls OpenAI (GPT-4o) via Supabase Edge Function proxy.

import { supabase } from '@/integrations/supabase/client';
import type { AIMessage, AIResponse } from '../types/interpreter.types';

export class OpenAIProvider {
  readonly name = 'openai';
  readonly displayName = 'ChatGPT (OpenAI)';
  private functionName = 'interpreter-openai';

  async chat(messages: AIMessage[], systemPrompt?: string): Promise<AIResponse> {
    const payload = {
      messages,
      systemPrompt: systemPrompt || this.defaultSystemPrompt(),
    };

    const { data, error } = await supabase.functions.invoke(this.functionName, {
      body: payload,
    });

    if (error) throw new Error(`OpenAI error: ${error.message}`);

    return {
      content: data.content || data.message || '',
      provider: 'openai',
      model: data.model || 'gpt-4o',
      usage: data.usage,
    };
  }

  async complete(prompt: string, context?: string): Promise<string> {
    const messages: AIMessage[] = [
      { role: 'user', content: context ? `${context}\n\n${prompt}` : prompt },
    ];
    const response = await this.chat(messages);
    return response.content;
  }

  // Best for structured tasks, function calling, form filling
  canHandle(taskType: string): boolean {
    return ['fill_form', 'checkout', 'call', 'message', 'search'].includes(taskType);
  }

  private defaultSystemPrompt(): string {
    return `You are Aria, a voice-activated AI interpreter for a blind user.
Assist with structured tasks: filling forms, shopping, messaging, and navigation.
- Be direct and action-oriented
- Confirm each step before executing
- Read back form fields before submitting
- For shopping: read price, availability, and product details
- For calls: narrate dial tones and menu options
Keep responses brief and conversational.`;
  }
}
