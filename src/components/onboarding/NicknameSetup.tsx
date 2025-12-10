import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { User, Heart, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';

interface NicknameSetupProps {
  onComplete: (nickname: string) => void;
  onBack?: () => void;
}

export const NicknameSetup: React.FC<NicknameSetupProps> = ({
  onComplete,
  onBack,
}) => {
  const [nickname, setNickname] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  
  const { speak, isSpeaking, voiceEnabled } = useVoiceSettings();

  const explanation = "Now tell me what you want me to call you. Not your real name — just the name that feels safe.";

  useEffect(() => {
    setIsVisible(true);
    if (voiceEnabled) {
      speak(explanation);
    }
  }, []);

  const handleContinue = () => {
    if (nickname.trim()) {
      onComplete(nickname.trim());
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
          <User className="w-10 h-10 text-primary" />
        </div>

        {/* Title */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">Your Safe Name</h2>
          <p className="text-foreground/70 text-sm max-w-xs leading-relaxed">
            Not your real name — just the name that feels safe. This is how I'll address you.
          </p>
        </div>

        {/* Nickname Input */}
        <div className="w-full max-w-xs space-y-2">
          <div className="relative">
            <Heart className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              className={cn(
                "h-14 pl-12 text-lg",
                "bg-card/60 border-border/40 rounded-xl"
              )}
              maxLength={20}
              autoFocus
            />
          </div>
          <p className="text-xs text-muted-foreground/60 text-center">
            Examples: Alex, Star, Friend, anything you like
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button
            onClick={handleContinue}
            size="lg"
            className="w-full h-14 rounded-xl text-lg"
            disabled={!nickname.trim()}
          >
            Continue
          </Button>

          {onBack && (
            <button
              onClick={onBack}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Go back
            </button>
          )}
        </div>

        {/* Privacy note */}
        <p className="text-xs text-muted-foreground/60 text-center">
          This stays on your device. I never share it.
        </p>
      </div>
    </div>
  );
};
