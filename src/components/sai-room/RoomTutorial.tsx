import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Wind, Target, Coffee, Search, Settings, Flame, 
  ChevronRight, MessageCircle, HelpCircle, Sparkles 
} from 'lucide-react';

interface TutorialStep {
  id: string;
  objectLabel: string;
  objectIcon: React.ReactNode;
  title: string;
  description: string;
  tip: string;
}

interface RoomTutorialProps {
  saiName: string;
  userName: string;
  onComplete: () => void;
  onSkip: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'grounding',
    objectLabel: 'Rug',
    objectIcon: <Wind className="w-5 h-5" />,
    title: 'The Grounding Rug',
    description: "When you feel overwhelmed, come here. Sit, breathe, feel the floor beneath you. I'll guide you through grounding exercises — 5-4-3-2-1, body scans, breathing.",
    tip: "Tap it anytime you need to pause and reset.",
  },
  {
    id: 'goals',
    objectLabel: 'Notebook',
    objectIcon: <Target className="w-5 h-5" />,
    title: 'Your Goals Notebook',
    description: "This is where we track your micro-goals. Not big life plans — just small, doable steps. One breath. One glass of water. One minute outside.",
    tip: "Goals here are celebrations, not obligations.",
  },
  {
    id: 'tools',
    objectLabel: 'Coffee Table',
    objectIcon: <Coffee className="w-5 h-5" />,
    title: 'Daily Tools',
    description: "Your habits and routines live here. Things that help you stay steady — check-ins, self-care reminders, mood tracking.",
    tip: "We build routines slowly. No pressure.",
  },
  {
    id: 'research',
    objectLabel: 'Bookshelf',
    objectIcon: <Search className="w-5 h-5" />,
    title: 'Information & Advocacy',
    description: "Need scripts for difficult conversations? Information about your conditions? Resources for support? It's all here.",
    tip: "You can ask me anything — I'll help you find words.",
  },
  {
    id: 'settings',
    objectLabel: 'Lamp',
    objectIcon: <Settings className="w-5 h-5" />,
    title: 'How I Communicate',
    description: "Adjust how I talk to you — slower, quieter, more or less detail. Change the room ambiance. Make this space truly yours.",
    tip: "Your preferences matter. Customize freely.",
  },
  {
    id: 'comfort',
    objectLabel: 'Fireplace',
    objectIcon: <Flame className="w-5 h-5" />,
    title: 'Warmth & Comfort',
    description: "Sometimes you just need warmth. This is for emotional comfort — gentle presence, soft sounds, calming visuals.",
    tip: "No goal required. Just be here.",
  },
];

export const RoomTutorial: React.FC<RoomTutorialProps> = ({
  saiName,
  userName,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepVisible, setStepVisible] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);

  useEffect(() => {
    setTimeout(() => setStepVisible(true), 300);
  }, []);

  useEffect(() => {
    setStepVisible(false);
    const timer = setTimeout(() => setStepVisible(true), 300);
    return () => clearTimeout(timer);
  }, [currentStep, showFollowUp]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowFollowUp(true);
    }
  };

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  if (showFollowUp) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className={cn(
          "bg-card/95 backdrop-blur-xl rounded-3xl border border-border/40 p-8 max-w-md w-full shadow-2xl",
          "transition-all duration-500",
          stepVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}>
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-center mb-4">
            You're All Set, {userName}
          </h2>

          <p className="text-center text-foreground/80 mb-6">
            Your room is ready. I'm here whenever you need me — to talk, to ground, or just to sit together in quiet.
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
              <HelpCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Have questions?</p>
                <p className="text-xs text-muted-foreground">Just ask. I'll explain anything again.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
              <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Goals not covered yet?</p>
                <p className="text-xs text-muted-foreground">We can add them together anytime.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
              <MessageCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Need to talk?</p>
                <p className="text-xs text-muted-foreground">I'm always here. No judgment.</p>
              </div>
            </div>
          </div>

          <Button
            onClick={onComplete}
            size="lg"
            className="w-full h-14 rounded-2xl text-lg shadow-lg shadow-primary/20"
          >
            Enter My Room
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      {/* Highlight indicator for object - positioned at bottom on mobile */}
      <div className={cn(
        "absolute hidden sm:block",
        "transition-all duration-700",
        stepVisible ? "opacity-100" : "opacity-0"
      )}
        style={{
          // Position varies by step - this is a simplified version
          left: '50%',
          top: '30%',
          transform: 'translateX(-50%)',
        }}
      >
        <div className="w-20 h-20 rounded-full border-2 border-primary animate-pulse bg-primary/10" />
      </div>

      {/* Tutorial card */}
      <div className={cn(
        "bg-card/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl border border-border/40 p-6 max-w-md w-full shadow-2xl",
        "transition-all duration-500",
        stepVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}>
        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full mb-6 overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Object indicator */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            {step.objectIcon}
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Object</p>
            <p className="font-medium text-foreground">{step.objectLabel}</p>
          </div>
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {step.title}
        </h3>
        <p className="text-foreground/80 text-sm leading-relaxed mb-4">
          {step.description}
        </p>

        {/* Tip */}
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 mb-6">
          <p className="text-xs text-primary">
            💡 {step.tip}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 h-12 rounded-xl text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Skip tutorial
          </button>
          <Button
            onClick={handleNext}
            className="flex-1 h-12 rounded-xl"
          >
            {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Finish'}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Step counter */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          {currentStep + 1} of {tutorialSteps.length}
        </p>
      </div>
    </div>
  );
};
