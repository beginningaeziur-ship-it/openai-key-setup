import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Heart, Volume2, VolumeX, Dog, Shield, Compass, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import comfortOfficeBg from '@/assets/comfort-office-bg.jpg';

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
  const [phase, setPhase] = useState<'appearing' | 'intro' | 'role' | 'question' | 'ready'>('appearing');
  const [showQuestion, setShowQuestion] = useState(false);
  const { speak, stopSpeaking, isSpeaking, voiceEnabled, setVoiceEnabled } = useVoiceSettings();

  // SAI's introduction script per the spec
  const introText = `I'm ${saiName} — your Supportive Intelligence Agent. Think of me as a service dog, an advocate, a guide, your steady Yoda. I'll walk with you through every part of this program. You are safe here.`;
  const questionText = "Do you want me to explain anything before we continue?";

  const speakIntroduction = useCallback(async () => {
    if (voiceEnabled) {
      setPhase('intro');
      await speak(introText);
      
      // Wait a moment, then ask question
      setTimeout(async () => {
        setPhase('question');
        setShowQuestion(true);
        if (voiceEnabled) {
          await speak(questionText);
        }
        setPhase('ready');
      }, 800);
    } else {
      setPhase('intro');
      setTimeout(() => {
        setPhase('question');
        setShowQuestion(true);
        setTimeout(() => setPhase('ready'), 1500);
      }, 3000);
    }
  }, [voiceEnabled, speak, introText, questionText]);

  useEffect(() => {
    // Phase 1: SAI appears
    const appearTimer = setTimeout(() => {
      speakIntroduction();
    }, 1200);

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

  const handleExplainMore = () => {
    if (voiceEnabled) {
      speak("I am here to help you navigate life, not control it. I will teach you to make decisions, ground yourself when overwhelmed, and advocate for what you need. We go at your pace. You lead, I walk beside you.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Comfort office background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${comfortOfficeBg})` }}
      />
      
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/40" />

      {/* Warm ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className={cn(
            "absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-[100px] transition-opacity duration-1000",
            phase !== 'appearing' ? "opacity-100" : "opacity-0"
          )}
          style={{ background: 'radial-gradient(ellipse, rgba(251, 191, 36, 0.15) 0%, transparent 70%)' }}
        />
      </div>

      {/* Voice toggle */}
      <button
        onClick={toggleVoice}
        className={cn(
          "absolute top-6 right-6 p-3 rounded-full transition-all z-10",
          "bg-black/40 backdrop-blur-md border border-white/10",
          "hover:bg-black/60",
          isSpeaking && "ring-2 ring-primary/50"
        )}
        aria-label={voiceEnabled ? "Mute voice" : "Enable voice"}
      >
        {voiceEnabled ? (
          <Volume2 className={cn("w-5 h-5", isSpeaking ? "text-primary animate-pulse" : "text-white/80")} />
        ) : (
          <VolumeX className="w-5 h-5 text-white/50" />
        )}
      </button>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-xl mx-4 px-4">
        
        {/* SAI Avatar */}
        <div 
          className={cn(
            "relative transition-all duration-1000 ease-out",
            phase === 'appearing' ? "scale-0 opacity-0" : "scale-100 opacity-100"
          )}
        >
          {/* Avatar glow */}
          <div 
            className={cn(
              "absolute inset-0 rounded-full transition-opacity duration-700",
              isSpeaking ? "opacity-100" : "opacity-50"
            )}
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
              filter: 'blur(20px)',
              transform: 'scale(1.8)',
            }}
          />
          
          <div className={cn(
            "relative w-24 h-24 rounded-full",
            "bg-gradient-to-br from-primary/60 to-primary/30",
            "flex items-center justify-center backdrop-blur-sm",
            "border-2 border-primary/40 shadow-xl shadow-primary/20",
            isSpeaking && "animate-pulse"
          )}>
            <Heart className="w-10 h-10 text-primary-foreground" />
          </div>
          
          {/* Name badge */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
            <span className="text-sm font-medium text-white">{saiName}</span>
          </div>

          {/* Speaking indicator */}
          {isSpeaking && (
            <div className="absolute -right-1 -top-1">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
              </span>
            </div>
          )}
        </div>

        {/* Introduction text */}
        <div 
          className={cn(
            "text-center space-y-5 transition-all duration-700",
            phase !== 'appearing' ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
        >
          {/* Main introduction card */}
          <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl">
            <p className="text-lg md:text-xl text-white font-light leading-relaxed">
              "I'm <span className="text-primary font-medium">{saiName}</span> — your Supportive Intelligence Agent."
            </p>
            
            {/* Role icons */}
            <div 
              className={cn(
                "flex items-center justify-center gap-6 mt-5 transition-all duration-500 delay-300",
                phase !== 'appearing' ? "opacity-100" : "opacity-0"
              )}
            >
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Dog className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-[10px] text-white/60 uppercase tracking-wider">Service Dog</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-[10px] text-white/60 uppercase tracking-wider">Advocate</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Compass className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-[10px] text-white/60 uppercase tracking-wider">Guide</span>
              </div>
            </div>

            <p className="text-white/70 mt-5 text-sm leading-relaxed">
              I'll walk with you through every part of this program.
              <br />
              <span className="text-primary/90 font-medium">You are safe here.</span>
            </p>
          </div>

          {/* Question prompt */}
          <div 
            className={cn(
              "bg-primary/10 backdrop-blur-sm rounded-xl border border-primary/20 p-4 transition-all duration-500",
              showQuestion ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-white/90 text-sm">
                Do you want me to explain anything before we continue?
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div 
            className={cn(
              "flex flex-col sm:flex-row gap-3 pt-2 transition-all duration-500",
              phase === 'ready' ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <Button
              onClick={handleExplainMore}
              variant="outline"
              size="lg"
              className="h-12 px-6 rounded-xl bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white"
              disabled={phase !== 'ready'}
            >
              Tell me more
            </Button>
            <Button
              onClick={handleContinue}
              size="lg"
              className="h-12 px-8 rounded-xl shadow-lg shadow-primary/30"
              disabled={phase !== 'ready'}
            >
              I understand, continue
            </Button>
          </div>
        </div>

        {/* Privacy assurance */}
        <p 
          className={cn(
            "text-xs text-white/40 text-center mt-2 transition-opacity duration-1000",
            phase === 'ready' ? "opacity-100" : "opacity-0"
          )}
        >
          Everything here is private. Nothing leaves your device.
        </p>
      </div>

      {/* Subtle floating particles */}
      <div className={cn(
        "absolute inset-0 pointer-events-none transition-opacity duration-1000",
        phase !== 'appearing' ? "opacity-100" : "opacity-0"
      )}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            style={{
              left: `${15 + i * 10}%`,
              top: `${25 + (i % 3) * 20}%`,
              animation: `float-particle ${6 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
      </div>

      {/* Custom animation */}
      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-15px) translateX(8px); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
