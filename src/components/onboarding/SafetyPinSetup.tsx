import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Shield, Lock, Eye, EyeOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';

interface SafetyPinSetupProps {
  onComplete: (pin: string) => void;
  onBack?: () => void;
}

export const SafetyPinSetup: React.FC<SafetyPinSetupProps> = ({
  onComplete,
  onBack,
}) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [isVisible, setIsVisible] = useState(false);
  
  const { speak, isSpeaking, voiceEnabled } = useVoiceSettings();

  const explanation = "Let's set your safety PIN. This keeps others from opening your program if they pick up your phone. Choose a 4-digit PIN that you'll remember.";

  useEffect(() => {
    setIsVisible(true);
    if (voiceEnabled) {
      speak(explanation);
    }
  }, []);

  const handlePinChange = (value: string, isConfirm = false) => {
    // Only allow digits, max 4
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (isConfirm) {
      setConfirmPin(cleaned);
    } else {
      setPin(cleaned);
    }
    setError('');
  };

  const handleContinue = () => {
    if (step === 'enter') {
      if (pin.length !== 4) {
        setError('Please enter a 4-digit PIN');
        return;
      }
      setStep('confirm');
      if (voiceEnabled) {
        speak("Now enter your PIN again to confirm.");
      }
    } else {
      if (confirmPin !== pin) {
        setError("PINs don't match. Please try again.");
        setConfirmPin('');
        return;
      }
      onComplete(pin);
    }
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-gradient-to-b from-[#0d0d1a] via-[#1a1a2e] to-[#0f0f1f]",
        "transition-opacity duration-700",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="flex flex-col items-center gap-8 max-w-md mx-4 w-full">
        {/* Icon */}
        <div className={cn(
          "w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center",
          "border border-primary/30 shadow-lg shadow-primary/10",
          isSpeaking && "animate-pulse"
        )}>
          <Shield className="w-10 h-10 text-primary" />
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Safety PIN</h2>
          <p className="text-foreground/70 text-sm max-w-xs">
            {step === 'enter' 
              ? "This keeps others from opening your program if they pick up your phone."
              : "Enter your PIN again to confirm."
            }
          </p>
        </div>

        {/* PIN Input */}
        <div className="w-full max-w-xs space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type={showPin ? 'text' : 'password'}
              value={step === 'enter' ? pin : confirmPin}
              onChange={(e) => handlePinChange(e.target.value, step === 'confirm')}
              placeholder={step === 'enter' ? "Enter 4-digit PIN" : "Confirm your PIN"}
              className={cn(
                "h-14 pl-12 pr-12 text-center text-2xl tracking-[0.5em] font-mono",
                "bg-card/60 border-border/40 rounded-xl",
                error && "border-destructive"
              )}
              maxLength={4}
              inputMode="numeric"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          {/* PIN strength indicator */}
          {step === 'enter' && (
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300",
                    pin.length > i ? "bg-primary scale-100" : "bg-border/40 scale-75"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button
            onClick={handleContinue}
            size="lg"
            className="w-full h-14 rounded-xl text-lg"
            disabled={(step === 'enter' ? pin : confirmPin).length !== 4}
          >
            {step === 'enter' ? 'Continue' : 'Set PIN'}
          </Button>

          {step === 'confirm' && (
            <button
              onClick={() => {
                setStep('enter');
                setConfirmPin('');
                setError('');
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Go back
            </button>
          )}
        </div>

        {/* Privacy note */}
        <p className="text-xs text-muted-foreground/60 text-center">
          Your PIN is stored only on this device. We never see it.
        </p>
      </div>
    </div>
  );
};
