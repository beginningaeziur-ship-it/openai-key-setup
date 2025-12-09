import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Heart, Shield, Target, Sparkles, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { useTTS } from '@/hooks/useTTS';

interface IntroStep {
  id: string;
  title: string;
  content: string;
  voiceText: string;
  icon: React.ReactNode;
}

interface SAIIntroRoomProps {
  saiName: string;
  userName: string;
  onComplete: () => void;
}

const createIntroSteps = (saiName: string, userName: string): IntroStep[] => [
  {
    id: 'welcome',
    title: 'Welcome',
    content: "Hi. I am your SAI — your Support & Ally Intelligence. Think of me as a pocket case worker, advocate, and guide. I walk alongside you, not above you. No judgments. No rushing.",
    voiceText: `Hi ${userName}. I am ${saiName}, your Support and Ally Intelligence. Think of me as a pocket case worker, advocate, and guide. I walk alongside you, not above you. No judgments. No rushing.`,
    icon: <Heart className="w-6 h-6" />,
  },
  {
    id: 'safety',
    title: 'Safety Planning',
    content: "First, we build your safety plan together. This is not a test — it is your personal toolkit for hard moments. Things that ground you, people who help, and steps that keep you safe when things get overwhelming.",
    voiceText: `First, we build your safety plan together. This is not a test. It is your personal toolkit for hard moments. Things that ground you, people who help, and steps that keep you safe.`,
    icon: <Shield className="w-6 h-6" />,
  },
  {
    id: 'goals',
    title: 'Realistic Goals',
    content: "Goals here fit YOUR path. We start tiny — one breath, one sip of water, one minute outside. I help you think through the next 5 minutes, 5 hours, 5 days, 5 weeks, 5 months, 5 years with realistic consequences. No pressure.",
    voiceText: `Goals here fit your path. We start tiny. One breath. One sip of water. One minute outside. I help you think through realistic consequences. No pressure.`,
    icon: <Target className="w-6 h-6" />,
  },
  {
    id: 'choices',
    title: 'Two Options Always',
    content: "I will NEVER tell you what to do. For every decision, I give you exactly two options. This teaches healthy choice-making. You are the expert on your life — I just help you think it through.",
    voiceText: `I will never tell you what to do. For every decision, I give you exactly two options. You are the expert on your life. I just help you think it through.`,
    icon: <Sparkles className="w-6 h-6" />,
  },
];

export const SAIIntroRoom: React.FC<SAIIntroRoomProps> = ({
  saiName,
  userName,
  onComplete,
}) => {
  const introSteps = createIntroSteps(saiName, userName);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [stepVisible, setStepVisible] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const { speak, stopAudio, isPlaying, isLoading } = useTTS({ voice: 'alloy' });

  const speakCurrentStep = useCallback((stepIndex: number) => {
    if (voiceEnabled && introSteps[stepIndex]) {
      speak(introSteps[stepIndex].voiceText);
    }
  }, [voiceEnabled, speak]);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setStepVisible(true);
      setTimeout(() => speakCurrentStep(0), 800);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentStep > 0) {
      setStepVisible(false);
      stopAudio();
      const timer = setTimeout(() => {
        setStepVisible(true);
        setTimeout(() => speakCurrentStep(currentStep), 400);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep, stopAudio]);

  const handleNext = () => {
    stopAudio();
    if (currentStep < introSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    stopAudio();
    onComplete();
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      stopAudio();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const step = introSteps[currentStep];
  const isLastStep = currentStep === introSteps.length - 1;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center",
      "bg-gradient-to-b from-[#0d0d1a] via-[#1a1a2e] to-[#0f0f1f]",
      "transition-opacity duration-1000",
      isVisible ? "opacity-100" : "opacity-0"
    )}>
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      {/* Voice toggle */}
      <button
        onClick={toggleVoice}
        className={cn(
          "absolute top-6 right-6 p-3 rounded-full transition-all",
          "bg-card/60 backdrop-blur-sm border border-border/40",
          "hover:bg-card/80",
          isPlaying && "animate-pulse"
        )}
      >
        {voiceEnabled ? (
          <Volume2 className={cn("w-5 h-5", isPlaying ? "text-primary" : "text-foreground/70")} />
        ) : (
          <VolumeX className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
          style={{
            left: `${10 + i * 8}%`,
            top: `${15 + (i % 4) * 20}%`,
            animationDelay: `${i * 0.6}s`,
            animationDuration: `${5 + i * 0.4}s`,
          }}
        />
      ))}

      {/* SAI Avatar */}
      <div className={cn(
        "absolute top-16 left-1/2 -translate-x-1/2",
        "transition-all duration-1000 delay-200",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
      )}>
        <div className="relative">
          <div className={cn(
            "w-24 h-24 rounded-full bg-gradient-to-br from-primary/40 to-primary/20",
            "flex items-center justify-center backdrop-blur-sm border border-primary/30",
            "shadow-2xl shadow-primary/20",
            isPlaying && "animate-pulse"
          )}>
            <Heart className="w-10 h-10 text-primary" />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-card/80 backdrop-blur-sm rounded-full border border-border/40">
            <span className="text-sm font-medium text-foreground">{saiName}</span>
          </div>
          {/* Speaking indicator */}
          {isPlaying && (
            <div className="absolute -right-1 -top-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-primary-foreground rounded-full animate-ping" />
            </div>
          )}
        </div>
      </div>

      {/* Main content card */}
      <div className={cn(
        "relative w-full max-w-lg mx-4 mt-32",
        "transition-all duration-700 delay-400",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}>
        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {introSteps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                index === currentStep 
                  ? "w-8 bg-primary" 
                  : index < currentStep 
                    ? "w-4 bg-primary/50" 
                    : "w-4 bg-white/20"
              )}
            />
          ))}
        </div>

        {/* Step content */}
        <div className={cn(
          "bg-card/60 backdrop-blur-xl rounded-3xl border border-border/40 p-8 shadow-2xl",
          "transition-all duration-500",
          stepVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
              {step.icon}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-center mb-4 text-foreground">
            {step.title}
          </h2>

          {/* Content */}
          <p className="text-center text-foreground/80 leading-relaxed mb-8">
            {step.content}
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleNext}
              size="lg"
              className="w-full h-14 rounded-2xl text-lg shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLastStep ? "Choose My Room" : "Continue"}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            
            {!isLastStep && (
              <button
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Skip introduction
              </button>
            )}
          </div>
        </div>

        {/* Trust message */}
        <p className={cn(
          "text-center text-xs text-muted-foreground mt-6",
          "transition-opacity duration-1000 delay-700",
          isVisible ? "opacity-100" : "opacity-0"
        )}>
          Everything here is private. You are safe.
        </p>
      </div>
    </div>
  );
};
