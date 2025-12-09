import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseVoiceInputOptions {
  onTranscription?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      // Try webm first, fall back to other formats
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        if (chunksRef.current.length === 0) {
          setError('No audio recorded');
          options.onError?.('No audio recorded');
          return;
        }

        setIsProcessing(true);

        try {
          const audioBlob = new Blob(chunksRef.current, { type: mimeType });
          
          // Convert to base64
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            try {
              const { data, error: fnError } = await supabase.functions.invoke('sai-stt', {
                body: { audio: base64Audio },
              });

              if (fnError) {
                throw new Error(fnError.message);
              }

              if (data?.error) {
                throw new Error(data.error);
              }

              if (data?.text) {
                options.onTranscription?.(data.text);
              }
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Failed to transcribe audio';
              setError(message);
              options.onError?.(message);
              console.error('STT error:', err);
            } finally {
              setIsProcessing(false);
            }
          };

          reader.onerror = () => {
            setError('Failed to read audio');
            options.onError?.('Failed to read audio');
            setIsProcessing(false);
          };

          reader.readAsDataURL(audioBlob);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to process audio';
          setError(message);
          options.onError?.(message);
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to access microphone';
      setError(message);
      options.onError?.(message);
      console.error('Microphone error:', err);
    }
  }, [options]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  }, [isRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isProcessing,
    error,
    startRecording,
    stopRecording,
    toggleRecording,
  };
}
