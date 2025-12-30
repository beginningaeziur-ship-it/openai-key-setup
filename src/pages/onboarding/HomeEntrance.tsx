import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FullBodySAI } from '@/components/sai/FullBodySAI';
import { Lock, Delete, Mic } from 'lucide-react';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useMicrophone } from '@/contexts/MicrophoneContext';
import cozyCabinBg from '@/assets/cozy-cabin-bg.jpg';

/**
 * HomeEntrance - SAI at door with pin pad
 * 
 * SAI speaks the intro, user sets their 4-digit security code
 * This is the final onboarding step before entering the safe home
 */

const INTRO_MESSAGES = [
  "Here we are — your new safe home.",
  "Before you enter, let's set up your security code.",
  "This 4-digit code protects your space. Only you will know it.",
  "Enter a code you'll remember."
];

// Word to digit mapping for voice input
const WORD_TO_DIGIT: Record<string, string> = {
  'zero': '0', 'oh': '0', 'o': '0',
  'one': '1', 'won': '1',
  'two': '2', 'to': '2', 'too': '2',
  'three': '3', 'tree': '3',
  'four': '4', 'for': '4', 'fore': '4',
  'five': '5',
  'six': '6', 'sicks': '6',
  'seven': '7',
  'eight': '8', 'ate': '8',
  'nine': '9', 'niner': '9',
};

export default function HomeEntrance() {
  const navigate = useNavigate();
  const { speak, isSpeaking, voiceEnabled } = useVoiceSettings();
  const { isMicEnabled, lastTranscript, clearTranscript } = useMicrophone();
  
  const [introIndex, setIntroIndex] = useState(0);
  const [introText, setIntroText] = useState('');
  const [showPinPad, setShowPinPad] = useState(false);
  
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');
  
  const hasSpokenRef = useRef<Set<number | string>>(new Set());
  const lastProcessedTranscriptRef = useRef<string>('');

  // Speak intro messages
  const speakIntroMessage = useCallback(async () => {
    const text = INTRO_MESSAGES[introIndex];
    if (!text) return;
    
    setIntroText(text);
    
    if (!hasSpokenRef.current.has(introIndex)) {
      hasSpokenRef.current.add(introIndex);
      
      if (voiceEnabled) {
        await speak(text);
      }
      
      if (introIndex < INTRO_MESSAGES.length - 1) {
        setTimeout(() => setIntroIndex(prev => prev + 1), 1500);
      } else {
        setTimeout(() => setShowPinPad(true), 500);
      }
    }
  }, [introIndex, speak, voiceEnabled]);

  useEffect(() => {
    speakIntroMessage();
  }, [introIndex, speakIntroMessage]);

  // Speak confirmation prompts
  useEffect(() => {
    if (showPinPad) {
      const prompt = isConfirming ? "Confirm your code." : "Enter a 4-digit code.";
      if (voiceEnabled && !isSpeaking) {
        // Only speak once when state changes
        const key = isConfirming ? 'confirm' : 'enter';
        if (!hasSpokenRef.current.has(key)) {
          hasSpokenRef.current.add(key);
          speak(prompt);
        }
      }
    }
  }, [showPinPad, isConfirming, voiceEnabled, isSpeaking, speak]);

  // Voice input for PIN digits
  useEffect(() => {
    if (!showPinPad || !lastTranscript || lastTranscript === lastProcessedTranscriptRef.current) return;
    
    lastProcessedTranscriptRef.current = lastTranscript;
    const words = lastTranscript.toLowerCase().split(/\s+/);
    
    // Extract digits from transcript
    let digitsToAdd = '';
    for (const word of words) {
      // Check if it's a direct digit
      if (/^[0-9]$/.test(word)) {
        digitsToAdd += word;
      } 
      // Check if it's a word that maps to a digit
      else if (WORD_TO_DIGIT[word]) {
        digitsToAdd += WORD_TO_DIGIT[word];
      }
    }
    
    // Add digits one by one
    if (digitsToAdd) {
      for (const digit of digitsToAdd) {
        if (isConfirming) {
          if (confirmPin.length < 4) {
            setConfirmPin(prev => (prev + digit).slice(0, 4));
          }
        } else {
          if (pin.length < 4) {
            setPin(prev => (prev + digit).slice(0, 4));
          }
        }
      }
      setError('');
    }
    
    // Check for clear/delete commands
    if (words.some(w => ['clear', 'reset', 'start over', 'delete all'].includes(w))) {
      if (isConfirming) {
        setConfirmPin('');
      } else {
        setPin('');
      }
    } else if (words.some(w => ['delete', 'back', 'remove', 'undo'].includes(w))) {
      if (isConfirming) {
        setConfirmPin(prev => prev.slice(0, -1));
      } else {
        setPin(prev => prev.slice(0, -1));
      }
    }
    
    clearTranscript();
  }, [lastTranscript, showPinPad, isConfirming, pin, confirmPin, clearTranscript]);

  const handleDigitPress = (digit: string) => {
    setError('');
    
    if (isConfirming) {
      if (confirmPin.length < 4) {
        setConfirmPin(prev => prev + digit);
      }
    } else {
      if (pin.length < 4) {
        setPin(prev => prev + digit);
      }
    }
  };

  const handleDelete = () => {
    if (isConfirming) {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
    setError('');
  };

  const handleClear = () => {
    if (isConfirming) {
      setConfirmPin('');
    } else {
      setPin('');
    }
    setError('');
  };

  // Auto-advance when 4 digits entered
  useEffect(() => {
    if (pin.length === 4 && !isConfirming) {
      setTimeout(() => setIsConfirming(true), 300);
    }
  }, [pin, isConfirming]);

  useEffect(() => {
    if (confirmPin.length === 4 && isConfirming) {
      if (confirmPin === pin) {
        // Success - save pin and navigate
        localStorage.setItem('sai_security_pin', pin);
        if (voiceEnabled) {
          speak("Perfect. Welcome to your safe home.");
        }
        setTimeout(() => {
          navigate('/bedroom');
        }, 1500);
      } else {
        setError("Codes don't match. Try again.");
        if (voiceEnabled) {
          speak("Those codes don't match. Please try again.");
        }
        setConfirmPin('');
      }
    }
  }, [confirmPin, isConfirming, pin, navigate, voiceEnabled, speak]);

  const currentPin = isConfirming ? confirmPin : pin;
  const saiState = isSpeaking ? 'speaking' : isMicEnabled ? 'listening' : 'attentive';

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${cozyCabinBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 max-w-4xl mx-auto">
        {/* SAI at the door */}
        <div className="flex-shrink-0">
          <FullBodySAI 
            size="lg" 
            state={saiState} 
          />
        </div>

        {/* Door with pin pad */}
        <div className="flex-1 max-w-md">
          {/* SAI speech */}
          <div className="bg-card/90 backdrop-blur-sm rounded-xl p-4 mb-6 border border-border/50">
            <p className="text-center text-foreground min-h-[50px]">
              {showPinPad 
                ? (isConfirming ? "Confirm your code." : "Enter a 4-digit code.") 
                : introText}
              {isSpeaking && <span className="animate-pulse ml-1">|</span>}
            </p>
          </div>

          {/* Pin pad */}
          {showPinPad && (
            <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-border/50">
              {/* Lock icon */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
              </div>

              {/* Pin display */}
              <div className="flex justify-center gap-3 mb-6">
                {[0, 1, 2, 3].map(index => (
                  <div 
                    key={index}
                    className={cn(
                      "w-12 h-14 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all",
                      currentPin.length > index 
                        ? "border-primary bg-primary/10 text-primary" 
                        : "border-muted bg-muted/20"
                    )}
                  >
                    {currentPin.length > index ? "•" : ""}
                  </div>
                ))}
              </div>

              {/* Error message */}
              {error && (
                <p className="text-destructive text-sm text-center mb-4">{error}</p>
              )}

              {/* Number pad */}
              <div className="grid grid-cols-3 gap-3">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                  <Button
                    key={digit}
                    variant="outline"
                    size="lg"
                    className="h-14 text-xl font-semibold"
                    onClick={() => handleDigitPress(digit)}
                  >
                    {digit}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-14 text-sm"
                  onClick={handleClear}
                >
                  Clear
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 text-xl font-semibold"
                  onClick={() => handleDigitPress('0')}
                >
                  0
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-14"
                  onClick={handleDelete}
                >
                  <Delete className="w-5 h-5" />
                </Button>
              </div>

              {/* Status with mic indicator */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {isMicEnabled && (
                  <div className="flex items-center gap-1 text-primary animate-pulse">
                    <Mic className="w-4 h-4" />
                    <span className="text-xs">Say digits</span>
                  </div>
                )}
                <p className="text-center text-sm text-muted-foreground">
                  {isConfirming ? "Confirm your code" : "Create your code"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
