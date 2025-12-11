import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Lock, Eye, EyeOff, Heart, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useMicrophone } from '@/contexts/MicrophoneContext';
import comfortOfficeBg from '@/assets/comfort-office-bg.jpg';

interface SafetyPinSetupProps {
  onComplete: (pin: string) => void;
  onBack?: () => void;
}

export const SafetyPinSetup: React.FC<SafetyPinSetupProps> = ({
  onComplete,
}) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'intro' | 'enter' | 'confirm'>('intro');
  const [isVisible, setIsVisible] = useState(false);
  
  const { speak, stopSpeaking, isSpeaking, voiceEnabled, setVoiceEnabled, isLoading } = useVoiceSettings();
  const { isMicEnabled, isListening, lastTranscript, enableMicrophone, clearTranscript } = useMicrophone();

  // SAI speaks this
  const introScript = "Let's protect your space. Set a PIN so no one can open your app or read what we're working on together. Choose 4 numbers you'll remember.";

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(async () => {
      if (voiceEnabled) {
        await speak(introScript);
      }
      setStep('enter');
    }, 600);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, []);

  // Handle voice input for PIN
  useEffect(() => {
    if (lastTranscript && step !== 'intro') {
      const numbers = lastTranscript.replace(/\D/g, '');
      if (numbers.length >= 4) {
        if (step === 'enter') {
          setPin(numbers.slice(0, 4));
          speak("Good. Now say those numbers again to confirm.");
          setStep('confirm');
        } else if (step === 'confirm') {
          setConfirmPin(numbers.slice(0, 4));
        }
        clearTranscript();
      }
    }
  }, [lastTranscript, step, clearTranscript, speak]);

  const handlePinChange = (value: string, isConfirm = false) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (isConfirm) {
      setConfirmPin(cleaned);
    } else {
      setPin(cleaned);
    }
    setError('');
  };

  const handleContinue = async () => {
    if (step === 'enter') {
      if (pin.length !== 4) {
        setError('Please enter a 4-digit PIN');
        if (voiceEnabled) await speak("I need 4 numbers for your PIN.");
        return;
      }
      setStep('confirm');
      if (voiceEnabled) {
        await speak("Now enter those numbers again to confirm.");
      }
    } else if (step === 'confirm') {
      if (confirmPin !== pin) {
        setError("Those don't match. Try again.");
        if (voiceEnabled) await speak("Those numbers don't match. Let's try the confirmation again.");
        setConfirmPin('');
        return;
      }
      if (voiceEnabled) await speak("Perfect. Your PIN is set.");
      onComplete(pin);
    }
  };

  const toggleVoice = () => {
    if (voiceEnabled) stopSpeaking();
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex flex-col overflow-hidden",
        "transition-opacity duration-700",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${comfortOfficeBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-black/40" />

      {/* Top controls */}
      <div className="relative z-20 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleVoice}
            className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60"
          >
            {voiceEnabled ? (
              <Volume2 className={cn("w-5 h-5", isSpeaking ? "text-primary animate-pulse" : "text-white/80")} />
            ) : (
              <VolumeX className="w-5 h-5 text-white/50" />
            )}
          </button>
          <button
            onClick={!isMicEnabled ? enableMicrophone : undefined}
            className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60"
          >
            {isMicEnabled ? (
              <Mic className={cn("w-5 h-5", isListening ? "text-emerald-400 animate-pulse" : "text-white/80")} />
            ) : (
              <MicOff className="w-5 h-5 text-white/50" />
            )}
          </button>
        </div>
        <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-black/40 backdrop-blur-md border border-white/10 text-white/70">
          {isSpeaking ? "SAI speaking..." : isListening ? "Listening..." : "Ready"}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        {/* SAI Avatar */}
        <div className="relative mb-6">
          <div 
            className={cn(
              "absolute inset-0 rounded-full transition-all duration-500",
              isSpeaking ? "opacity-100 scale-150" : "opacity-40 scale-125"
            )}
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
              filter: 'blur(25px)',
            }}
          />
          <div className={cn(
            "relative w-16 h-16 rounded-full bg-gradient-to-br from-primary/60 to-primary/30",
            "flex items-center justify-center border-2 border-primary/40",
            isSpeaking && "animate-pulse"
          )}>
            <Heart className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* PIN Card */}
        <div className="w-full max-w-xs bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-primary" />
            <span className="text-white font-medium">
              {step === 'enter' ? 'Set PIN' : 'Confirm PIN'}
            </span>
          </div>

          <div className="relative mb-3">
            <Input
              type={showPin ? 'text' : 'password'}
              value={step === 'enter' ? pin : confirmPin}
              onChange={(e) => handlePinChange(e.target.value, step === 'confirm')}
              placeholder="• • • •"
              className={cn(
                "h-14 text-center text-2xl tracking-[0.5em] font-mono",
                "bg-white/10 border-white/20 text-white placeholder:text-white/30",
                error && "border-red-500/50"
              )}
              maxLength={4}
              inputMode="numeric"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
            >
              {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && <p className="text-red-400 text-xs text-center mb-3">{error}</p>}

          {/* PIN dots */}
          <div className="flex justify-center gap-2 mb-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all",
                  (step === 'enter' ? pin : confirmPin).length > i 
                    ? "bg-primary" 
                    : "bg-white/20"
                )}
              />
            ))}
          </div>

          <p className="text-white/50 text-xs text-center">
            {isMicEnabled ? "Say 4 numbers or type them" : "Type 4 numbers"}
          </p>
        </div>
      </div>

      {/* Bottom action */}
      <div className="relative z-10 p-6 pb-8">
        <Button
          onClick={handleContinue}
          size="lg"
          className="w-full max-w-xs mx-auto h-12 rounded-xl shadow-lg shadow-primary/30 block"
          disabled={(step === 'enter' ? pin : confirmPin).length !== 4 || step === 'intro'}
        >
          {step === 'enter' ? 'Continue' : 'Set PIN'}
        </Button>
        <p className="text-white/40 text-xs text-center mt-3">
          Stored only on your device
        </p>
      </div>
    </div>
  );
};
