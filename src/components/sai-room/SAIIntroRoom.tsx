import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Heart, Shield, Target, Sparkles, ChevronRight } from 'lucide-react';

interface IntroStep {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
}

interface SAIIntroRoomProps {
  saiName: string;
  userName: string;
  onComplete: () => void;
}

const introSteps: IntroStep[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    content: "Hi. I'm your SAI — your Support & Ally Intelligence. I'm here to walk alongside you, not above you. No judgments. No rushing. Just steady presence.",
    icon: <Heart className="w-6 h-6" />,
  },
  {
    id: 'safety',
    title: 'Safety First',
    content: "Before anything else, we build your safety plan together. This isn't a test — it's your personal toolkit for hard moments. Things that ground you, people who help, and steps that keep you safe.",
    icon: <Shield className="w-6 h-6" />,
  },
  {
    id: 'goals',
    title: 'Goals Your Way',
    content: "Goals here are different. We start tiny — sometimes just one breath, one sip of water, one minute of rest. You decide what 'progress' means. I help you track it without pressure.",
    icon: <Target className="w-6 h-6" />,
  },
  {
    id: 'trust',
    title: 'Building Trust',
    content: "Everything we do together is at your pace. I'll never push, command, or judge. When you're ready, we'll explore your room — each object has a purpose. You're in control.",
    icon: <Sparkles className="w-6 h-6" />,
  },
];

export const SAIIntroRoom: React.FC<SAIIntroRoomProps> = ({
  saiName,
  userName,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [stepVisible, setStepVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setTimeout(() => setStepVisible(true), 500);
  }, []);

  useEffect(() => {
    setStepVisible(false);
    const timer = setTimeout(() => setStepVisible(true), 300);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < introSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
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

      {/* SAI Avatar - Warm presence */}
      <div className={cn(
        "absolute top-16 left-1/2 -translate-x-1/2",
        "transition-all duration-1000 delay-200",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
      )}>
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center backdrop-blur-sm border border-primary/30 shadow-2xl shadow-primary/20">
            <Heart className="w-10 h-10 text-primary animate-pulse" style={{ animationDuration: '3s' }} />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-card/80 backdrop-blur-sm rounded-full border border-border/40">
            <span className="text-sm font-medium text-foreground">{saiName}</span>
          </div>
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
            {step.content.replace('{userName}', userName).replace('{saiName}', saiName)}
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleNext}
              size="lg"
              className="w-full h-14 rounded-2xl text-lg shadow-lg shadow-primary/20"
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
          Everything here is private. You're safe.
        </p>
      </div>
    </div>
  );
};
