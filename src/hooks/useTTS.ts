import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseTTSOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
}

export function useTTS(options: UseTTSOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const isProcessingQueueRef = useRef(false);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    audioQueueRef.current = [];
    isProcessingQueueRef.current = false;
    setIsPlaying(false);
  }, []);

  const playAudioFromBase64 = useCallback((base64Audio: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsPlaying(false);
          resolve();
        };
        
        audio.onerror = (e) => {
          setIsPlaying(false);
          reject(new Error('Failed to play audio'));
        };
        
        setIsPlaying(true);
        audio.play().catch(reject);
      } catch (err) {
        reject(err);
      }
    });
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessingQueueRef.current || audioQueueRef.current.length === 0) {
      return;
    }

    isProcessingQueueRef.current = true;

    while (audioQueueRef.current.length > 0) {
      const base64Audio = audioQueueRef.current.shift();
      if (base64Audio) {
        try {
          await playAudioFromBase64(base64Audio);
        } catch (err) {
          console.error('Error playing queued audio:', err);
        }
      }
    }

    isProcessingQueueRef.current = false;
  }, [playAudioFromBase64]);

  const speak = useCallback(async (text: string, queueMode: boolean = false) => {
    if (!text.trim()) return;

    // Always stop any currently playing audio to prevent overlap
    stopAudio();

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('sai-voice', {
        body: { 
          text, 
          voice: options.voice || 'echo' 
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.audioContent) {
        if (queueMode) {
          audioQueueRef.current.push(data.audioContent);
          processQueue();
        } else {
          stopAudio();
          await playAudioFromBase64(data.audioContent);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate speech';
      setError(message);
      console.error('TTS error:', err);
      
      // Check for quota exceeded error
      if (message.includes('insufficient_quota') || message.includes('exceeded your current quota')) {
        toast.error('Voice is unavailable', {
          description: 'The OpenAI API key has run out of credits. Please update it in settings.',
          duration: 6000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [options.voice, playAudioFromBase64, processQueue, stopAudio]);

  const speakSequence = useCallback(async (texts: string[], delayMs: number = 0) => {
    stopAudio();
    
    for (let i = 0; i < texts.length; i++) {
      await speak(texts[i], true);
      if (delayMs > 0 && i < texts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }, [speak, stopAudio]);

  return {
    speak,
    speakSequence,
    stopAudio,
    isLoading,
    isPlaying,
    error,
  };
}
