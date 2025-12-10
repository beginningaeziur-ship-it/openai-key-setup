/**
 * DEPRECATED: This file is kept for backward compatibility.
 * All voice functionality should use useVoiceSettings() or useTTS() hooks instead.
 * 
 * These functions are NO-OPs to prevent double-voice issues.
 * Components using these should be migrated to use the hooks.
 */

export function stopElevenLabsVoice() {
  console.warn('[elevenlabs.ts] stopElevenLabsVoice is deprecated. Use useVoiceSettings().stopSpeaking()');
}

export async function playElevenLabsVoice(
  _text: string,
  _voice: string = 'alloy'
): Promise<void> {
  console.warn('[elevenlabs.ts] playElevenLabsVoice is deprecated. Use useVoiceSettings().speak()');
  // NO-OP to prevent double voice
}

export async function playVoiceSequence(
  _messages: string[],
  _delayBetween: number = 500,
  _voice: string = 'alloy'
): Promise<void> {
  console.warn('[elevenlabs.ts] playVoiceSequence is deprecated. Use useTTS().speakSequence()');
  // NO-OP to prevent double voice
}
