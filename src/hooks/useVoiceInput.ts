import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVoiceInputOptions {
  onTranscription?: (text: string) => void;
  onError?: (error: string) => void;
}

// Use browser's native Web Speech API - no API key needed
interface SpeechRecognitionType extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventType) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventType) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEventType {
  resultIndex: number;
  results: SpeechRecognitionResultListType;
}

interface SpeechRecognitionResultListType {
  length: number;
  item: (index: number) => SpeechRecognitionResultType;
  [index: number]: SpeechRecognitionResultType;
}

interface SpeechRecognitionResultType {
  isFinal: boolean;
  length: number;
  item: (index: number) => SpeechRecognitionAlternativeType;
  [index: number]: SpeechRecognitionAlternativeType;
}

interface SpeechRecognitionAlternativeType {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEventType {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionType;
    webkitSpeechRecognition: new () => SpeechRecognitionType;
  }
}

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const transcriptRef = useRef<string>('');

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Voice input is not supported in this browser');
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      transcriptRef.current = '';
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEventType) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          transcriptRef.current += finalTranscript;
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventType) => {
        console.error('Speech recognition error:', event.error);
        
        let errorMessage = 'Voice input failed';
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your connection.';
            break;
          case 'aborted':
            // User stopped, not an error
            return;
        }
        
        setError(errorMessage);
        options.onError?.(errorMessage);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsProcessing(true);
        
        // Small delay to ensure all results are captured
        setTimeout(() => {
          if (transcriptRef.current.trim()) {
            options.onTranscription?.(transcriptRef.current.trim());
          }
          setIsProcessing(false);
          setIsRecording(false);
        }, 100);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start voice input';
      setError(message);
      options.onError?.(message);
      console.error('Voice input error:', err);
    }
  }, [options]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
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
    isSupported,
    startRecording,
    stopRecording,
    toggleRecording,
  };
}
