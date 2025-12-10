import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';

/**
 * Hook that provides TTS functionality using the centralized VoiceSettingsContext.
 * This is now a thin wrapper around useVoiceSettings for backward compatibility.
 * 
 * All TTS goes through a SINGLE audio path to prevent double-voice issues.
 */
export function useTTS() {
  const { 
    speak, 
    stopSpeaking, 
    isLoading, 
    isSpeaking,
    voiceEnabled 
  } = useVoiceSettings();

  return {
    speak: async (text: string) => {
      if (!voiceEnabled) return;
      await speak(text);
    },
    speakSequence: async (texts: string[], delayMs: number = 0) => {
      for (let i = 0; i < texts.length; i++) {
        await speak(texts[i]);
        if (delayMs > 0 && i < texts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    },
    stopAudio: stopSpeaking,
    isLoading,
    isPlaying: isSpeaking,
    error: null,
  };
}
