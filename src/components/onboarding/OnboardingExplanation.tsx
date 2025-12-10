import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MapPin, Shield, Eye, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';

interface OnboardingExplanationProps {
  onContinue: () => void;
}

export const OnboardingExplanation: React.FC<OnboardingExplanationProps> = ({
  onContinue,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { speak, isSpeaking, voiceEnabled } = useVoiceSettings();

  const explanationText = "I'll walk you through this myself. You don't need to rush. You don't need to guess. We'll do everything together.";
  const privacyText = "I don't store your personal information. I keep only what keeps you safe. You decide what anyone else sees.";

  useEffect(() => {
    setIsVisible(true);
    if (voiceEnabled) {
      speak(explanationText);
      setTimeout(() => {
        if (voiceEnabled) {
          speak(privacyText);
        }
      }, 4000);
    }
  }, []);

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

      <div className="flex flex-col items-center gap-8 max-w-lg mx-4">
        {/* Cards */}
        <div className="space-y-4 w-full">
          {/* Onboarding explanation */}
          <div 
            className={cn(
              "bg-card/50 backdrop-blur-sm rounded-2xl border border-border/30 p-6",
              "transition-all duration-700",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">We'll do this together</h3>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  I'll walk you through this myself. You don't need to rush. You don't need to guess. We'll do everything together.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy explanation */}
          <div 
            className={cn(
              "bg-card/50 backdrop-blur-sm rounded-2xl border border-border/30 p-6",
              "transition-all duration-700 delay-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Your privacy is protected</h3>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  I don't store your personal information. I keep only what keeps you safe. You decide what anyone else sees.
                </p>
              </div>
            </div>
          </div>

          {/* Watcher explanation */}
          <div 
            className={cn(
              "bg-card/50 backdrop-blur-sm rounded-2xl border border-border/30 p-6",
              "transition-all duration-700 delay-300",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Your professionals only see progress</h3>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  The Watcher app is for your professionals only. They only see your goal progress — not your private thoughts or conversations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Continue button */}
        <Button
          onClick={onContinue}
          size="lg"
          className={cn(
            "h-14 px-10 rounded-2xl text-lg shadow-lg shadow-primary/20",
            "transition-all duration-700 delay-500",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          I'm ready to begin
        </Button>

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="flex items-center gap-2 text-primary/70">
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span className="text-xs">SAI is speaking...</span>
          </div>
        )}
      </div>
    </div>
  );
};
