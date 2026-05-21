// ── Google AI Provider ─────────────────────────────────────────────────────────
// Calls Google Gemini via the existing Lovable AI gateway (sai-chat function).

import { supabase } from '@/integrations/supabase/client';
import type { AIMessage, AIResponse } from '../types/interpreter.types';

export class GoogleAIProvider {
  readonly name = 'google';
  readonly displayName = 'Gemini (Google)';

  async chat(messages: AIMessage[], systemPrompt?: string): Promise<AIResponse> {
    const systemMessage: AIMessage = {
      role: 'system',
      content: systemPrompt || this.defaultSystemPrompt(),
    };

    const { data, error } = await supabase.functions.invoke('sai-chat', {
      body: {
        messages: [systemMessage, ...messages].filter(m => m.role !== 'system'),
        userContext: {
          saiName: 'Aria',
          userName: 'User',
          isInterpreterMode: true,
        },
      },
    });

    if (error) throw new Error(`Google AI error: ${error.message}`);

    const content = typeof data === 'string' ? data : (data?.content || data?.message || '');

    return {
      content,
      provider: 'google',
      model: 'gemini-2.5-flash',
    };
  }

  async complete(prompt: string): Promise<string> {
    const response = await this.chat([{ role: 'user', content: prompt }]);
    return response.content;
  }

  // Best for conversational, general Q&A, quick responses
  canHandle(taskType: string): boolean {
    return ['unknown', 'help', 'set_preference', 'repeat'].includes(taskType);
  }

  private defaultSystemPrompt(): string {
    return `You are Aria, a conversational AI interpreter for a blind user.
Answer questions naturally, describe things clearly, and assist with daily tasks.
Be concise — responses should be speakable in under 10 seconds.`;
  }
}
