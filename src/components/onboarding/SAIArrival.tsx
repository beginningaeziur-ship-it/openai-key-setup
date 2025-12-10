import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Heart, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';

interface SAIArrivalProps {
  saiName: string;
  userName: string;
  onContinue: () => void;
}

export const SAIArrival: React.FC<SAIArrivalProps> = ({
  saiName,
  userName,
  onContinue,
}) => {
  const [phase, setPhase] = useState<'appearing' | 'speaking' | 'ready'>('appearing');
  const [textVisible, setTextVisible] = useState(false);
  const { speak, stopSpeaking, isSpeaking, voiceEnabled, setVoiceEnabled } = useVoiceSettings();

  const arrivalText = `I'm ${saiName}, powered by Aezuir... and I'm here with you.`;
  const roleText = `I will guide you, teach you, listen, support you, and advocate for you. You never have to figure this alone. I walk with you through every step — not ahead of you, not behind you.`;

  const speakArrival = useCallback(async () => {
    if (voiceEnabled) {
      await speak(arrivalText);
      // Small pause before role explanation
      setTimeout(async () => {
        if (voiceEnabled) {
          await speak(roleText);
        }
        setPhase('ready');
      }, 500);
    } else {
      setTimeout(() => setPhase('ready'), 2000);
    }
  }, [voiceEnabled, speak, arrivalText, roleText]);

  useEffect(() => {
    // Phase 1: SAI appears
    const appearTimer = setTimeout(() => {
      setPhase('speaking');
      setTextVisible(true);
      speakArrival();
    }, 1500);

    return () => {
      clearTimeout(appearTimer);
      stopSpeaking();
    };
  }, []);

  const toggleVoice = () => {
    if (voiceEnabled) {
      stopSpeaking();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const handleContinue = () => {
    stopSpeaking();
    onContinue();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#0d0d1a] via-[#1a1a2e] to-[#0f0f1f]">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/15 rounded-full blur-[120px] animate-pulse-soft" />
      </div>

      {/* Voice toggle */}
      <button
        onClick={toggleVoice}
        className={cn(
          "absolute top-6 right-6 p-3 rounded-full transition-all z-10",
          "bg-card/60 backdrop-blur-sm border border-border/40",
          "hover:bg-card/80",
          isSpeaking && "animate-pulse"
        )}
      >
        {voiceEnabled ? (
          <Volume2 className={cn("w-5 h-5", isSpeaking ? "text-primary" : "text-foreground/70")} />
        ) : (
          <VolumeX className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* SAI Avatar - appears first */}
      <div className="flex flex-col items-center gap-8 max-w-lg mx-4">
        <div 
          className={cn(
            "relative transition-all duration-1000",
            phase === 'appearing' ? "scale-0 opacity-0" : "scale-100 opacity-100"
          )}
        >
          <div className={cn(
            "w-28 h-28 rounded-full bg-gradient-to-br from-primary/50 to-primary/20",
            "flex items-center justify-center backdrop-blur-sm border border-primary/30",
            "shadow-2xl shadow-primary/30",
            isSpeaking && "animate-pulse"
          )}>
            <Heart className="w-12 h-12 text-primary" />
          </div>
          
          {/* Name badge */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-card/90 backdrop-blur-sm rounded-full border border-border/40">
            <span className="text-base font-medium text-foreground">{saiName}</span>
          </div>

          {/* Speaking indicator */}
          {isSpeaking && (
            <div className="absolute -right-1 -top-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-primary-foreground rounded-full animate-ping" />
            </div>
          )}
        </div>

        {/* Text content */}
        <div 
          className={cn(
            "text-center space-y-6 transition-all duration-700",
            textVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          {/* Arrival message */}
          <p className="text-xl md:text-2xl text-foreground font-light leading-relaxed">
            "I'm <span className="text-primary font-medium">{saiName}</span>, powered by Aezuir...
            <br />and I'm here with you."
          </p>

          {/* Role explanation */}
          <div 
            className={cn(
              "bg-card/40 backdrop-blur-sm rounded-2xl border border-border/30 p-6 transition-all duration-700 delay-300",
              phase === 'ready' || phase === 'speaking' ? "opacity-100" : "opacity-0"
            )}
          >
            <p className="text-foreground/80 leading-relaxed">
              I will <span className="text-primary">guide</span> you, 
              <span className="text-primary"> teach</span> you, 
              <span className="text-primary"> listen</span>, 
              <span className="text-primary"> support</span> you, and 
              <span className="text-primary"> advocate</span> for you.
            </p>
            <p className="text-foreground/70 mt-3 text-sm">
              You never have to figure this alone. I walk with you through every step — not ahead of you, not behind you.
            </p>
          </div>

          {/* Continue button */}
          <Button
            onClick={handleContinue}
            size="lg"
            className={cn(
              "h-14 px-10 rounded-2xl text-lg shadow-lg shadow-primary/20 transition-all duration-500",
              phase === 'ready' ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            disabled={phase !== 'ready'}
          >
            I understand
          </Button>
        </div>

        {/* Trust message */}
        <p 
          className={cn(
            "text-xs text-muted-foreground/60 text-center transition-opacity duration-1000",
            phase === 'ready' ? "opacity-100" : "opacity-0"
          )}
        >
          Everything here is private. You are safe.
        </p>
      </div>

      {/* Floating particles */}
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-primary/25 rounded-full animate-float"
          style={{
            left: `${10 + i * 9}%`,
            top: `${20 + (i % 4) * 18}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${5 + i * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
};
