// ── Claude Provider ────────────────────────────────────────────────────────────
// Calls Anthropic Claude via Supabase Edge Function proxy.

import { supabase } from '@/integrations/supabase/client';
import type { AIMessage, AIResponse } from '../types/interpreter.types';

export class ClaudeProvider {
  readonly name = 'claude';
  readonly displayName = 'Claude (Anthropic)';
  private functionName = 'interpreter-claude';

  async chat(messages: AIMessage[], systemPrompt?: string): Promise<AIResponse> {
    const payload = {
      messages,
      systemPrompt: systemPrompt || this.defaultSystemPrompt(),
    };

    const { data, error } = await supabase.functions.invoke(this.functionName, {
      body: payload,
    });

    if (error) throw new Error(`Claude error: ${error.message}`);

    return {
      content: data.content || data.message || '',
      provider: 'claude',
      model: data.model || 'claude-sonnet-4-6',
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

  // Best for nuanced reasoning, accessibility descriptions, complex task planning
  canHandle(taskType: string): boolean {
    return ['describe_visual', 'read_screen', 'navigate', 'help', 'shop'].includes(taskType);
  }

  private defaultSystemPrompt(): string {
    return `You are Aria, a voice-activated AI interpreter for a blind user.
Your job is to narrate, describe, and automate the digital world using natural, concise speech.
- Describe UI elements clearly without visual metaphors
- Give step-by-step navigation instructions
- Read product details (price, color, expiration dates) accurately
- Keep responses under 2 sentences unless describing something complex
- Use cardinal directions and positional language ("first button", "top of page")
- Never say "I can see" — say "The screen shows" or "The page contains"`;
  }
}
