import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FullBodySAI } from '@/components/sai/FullBodySAI';
import { Lock, Delete } from 'lucide-react';
import cozyCabinBg from '@/assets/cozy-cabin-bg.jpg';

/**
 * HomeEntrance - SAI at door with pin pad
 * 
 * User sets their 4-digit security code
 * This is the final onboarding step before entering the safe home
 */

const INTRO_MESSAGES = [
  "Here we are — your new safe home.",
  "Before you enter, let's set up your security code.",
  "This 4-digit code protects your space. Only you will know it.",
  "Enter a code you'll remember."
];

export default function HomeEntrance() {
  const navigate = useNavigate();
  const [introIndex, setIntroIndex] = useState(0);
  const [introText, setIntroText] = useState('');
  const [isIntroTyping, setIsIntroTyping] = useState(true);
  const [showPinPad, setShowPinPad] = useState(false);
  
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');

  // Intro typewriter
  useEffect(() => {
    const text = INTRO_MESSAGES[introIndex];
    if (!text) return;
    
    let charIndex = 0;
    setIsIntroTyping(true);
    setIntroText('');

    const typeInterval = setInterval(() => {
      if (charIndex < text.length) {
        setIntroText(text.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsIntroTyping(false);
        
        if (introIndex < INTRO_MESSAGES.length - 1) {
          setTimeout(() => setIntroIndex(prev => prev + 1), 1500);
        } else {
          setTimeout(() => setShowPinPad(true), 500);
        }
      }
    }, 35);

    return () => clearInterval(typeInterval);
  }, [introIndex]);

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
        setTimeout(() => {
          navigate('/sai-room');
        }, 500);
      } else {
        setError("Codes don't match. Try again.");
        setConfirmPin('');
      }
    }
  }, [confirmPin, isConfirming, pin, navigate]);

  const currentPin = isConfirming ? confirmPin : pin;

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
            state={isIntroTyping ? 'speaking' : 'attentive'} 
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
              {isIntroTyping && <span className="animate-pulse">|</span>}
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

              {/* Status */}
              <p className="text-center text-sm text-muted-foreground mt-4">
                {isConfirming ? "Confirm your code" : "Create your code"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
