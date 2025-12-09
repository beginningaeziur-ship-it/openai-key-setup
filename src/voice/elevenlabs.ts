import { supabase } from '@/integrations/supabase/client';

/**
 * Play text-to-speech using ElevenLabs via our secure edge function
 */
export async function playElevenLabsVoice(text: string, voice: string = 'alloy'): Promise<void> {
  if (!text.trim()) return;

  try {
    const { data, error } = await supabase.functions.invoke('sai-voice', {
      body: { text, voice },
    });

    if (error) {
      console.error('ElevenLabs voice error:', error.message);
      return;
    }

    if (data?.error) {
      console.error('ElevenLabs voice error:', data.error);
      return;
    }

    if (data?.audioContent) {
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      await audio.play();
    }
  } catch (err) {
    console.error('Failed to play voice:', err);
  }
}

/**
 * Play a sequence of voice messages with optional delays
 */
export async function playVoiceSequence(
  messages: string[], 
  delayBetween: number = 500,
  voice: string = 'alloy'
): Promise<void> {
  for (let i = 0; i < messages.length; i++) {
    await playElevenLabsVoice(messages[i], voice);
    if (i < messages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayBetween));
    }
  }
}
