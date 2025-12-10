import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { 
  Volume2, VolumeX, ChevronRight, Sparkles,
  BedDouble, Shirt, Frame, Clock, Lamp, Square, CloudRain
} from 'lucide-react';

interface TourStep {
  id: string;
  objectLabel: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  voiceText: string;
}

interface BedroomTourProps {
  saiName: string;
  userName: string;
  onComplete: () => void;
  onSkip: () => void;
  onHighlightHotspot: (id: string | null) => void;
}

const tourSteps: TourStep[] = [
  {
    id: 'bed',
    objectLabel: 'Bed',
    icon: <BedDouble className="w-5 h-5" />,
    title: 'Rest & Grounding',
    description: "This is where we'll practice rest and breathing when things feel too heavy. Breathing exercises, body scans, and gentle rest tools live here.",
    voiceText: "This is where we'll practice rest and breathing when things feel too heavy. Breathing exercises, body scans, and gentle rest tools live here.",
  },
  {
    id: 'dresser',
    objectLabel: 'Dresser',
    icon: <Shirt className="w-5 h-5" />,
    title: 'Daily Living Tasks',
    description: "Here we'll build small self-care routines that match your energy. Hygiene, getting dressed, basic tasks — at your own pace.",
    voiceText: "Here we'll build small self-care routines that match your energy. Hygiene, getting dressed, basic tasks. At your own pace.",
  },
  {
    id: 'wall-art',
    objectLabel: 'Wall Art',
    icon: <Frame className="w-5 h-5" />,
    title: 'Emotions & Thoughts',
    description: "When thoughts get heavy, come here. Journaling prompts, CBT tools, and gentle reframes to help you process what you're feeling.",
    voiceText: "When thoughts get heavy, come here. Journaling prompts, reframes, and gentle tools to help you process what you're feeling.",
  },
  {
    id: 'clock',
    objectLabel: 'Clock',
    icon: <Clock className="w-5 h-5" />,
    title: 'Time & Reminders',
    description: "This helps us keep track of important times so nothing sneaks up on you. Appointments, medications, deadlines — all in one place.",
    voiceText: "This helps us keep track of important times so nothing sneaks up on you. Appointments, medications, deadlines. All in one place.",
  },
  {
    id: 'nightstand',
    objectLabel: 'Nightstand',
    icon: <Lamp className="w-5 h-5" />,
    title: "Today's Check-In",
    description: "Here we'll do quick check-ins, so I always know how you're really doing. Mood, safety, a quick status — just between us.",
    voiceText: "Here we'll do quick check-ins, so I always know how you're really doing. Mood, safety, a quick status. Just between us.",
  },
  {
    id: 'lamp',
    objectLabel: 'Lamp',
    icon: <Lamp className="w-5 h-5" />,
    title: 'Calm Settings',
    description: "This lets us adjust the calm level of the room. Brightness, sounds, how I communicate — make this space truly yours.",
    voiceText: "This lets us adjust the calm level of the room. Brightness, sounds, how I communicate. Make this space truly yours.",
  },
  {
    id: 'rug',
    objectLabel: 'Rug',
    icon: <Square className="w-5 h-5" />,
    title: 'Grounding Tools',
    description: "When you feel disconnected or overwhelmed, come here. 5-senses grounding, orientation exercises, dissociation support.",
    voiceText: "When you feel disconnected or overwhelmed, come here. Grounding through your senses, orientation, and support for when things feel unreal.",
  },
  {
    id: 'window',
    objectLabel: 'Window',
    icon: <CloudRain className="w-5 h-5" />,
    title: 'Look Outside',
    description: "Sometimes we need to shift perspective. Visual grounding, looking at the rain, remembering there's a world beyond this moment.",
    voiceText: "Sometimes we need to shift perspective. Visual grounding, watching the rain, remembering there's a world beyond this moment.",
  },
];

export const BedroomTour: React.FC<BedroomTourProps> = ({
  saiName,
  userName,
  onComplete,
  onSkip,
  onHighlightHotspot,
}) => {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = intro
  const [stepVisible, setStepVisible] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  
  const { speak, stopSpeaking, voiceEnabled, isSpeaking } = useVoiceSettings();

  // Highlight current hotspot
  useEffect(() => {
    if (currentStep >= 0 && currentStep < tourSteps.length && !showFollowUp) {
      onHighlightHotspot(tourSteps[currentStep].id);
    } else {
      onHighlightHotspot(null);
    }
    return () => onHighlightHotspot(null);
  }, [currentStep, showFollowUp, onHighlightHotspot]);

  // Initial intro
  useEffect(() => {
    const timer = setTimeout(() => {
      setStepVisible(true);
      if (voiceEnabled) {
        speak("Welcome to your room. This is our home base. I'll show you how each part can help us work together.");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const speakStep = useCallback((stepIndex: number) => {
    if (voiceEnabled && tourSteps[stepIndex]) {
      speak(tourSteps[stepIndex].voiceText);
    }
  }, [voiceEnabled, speak]);

  const handleNext = () => {
    stopSpeaking();
    
    if (currentStep === -1) {
      // Move from intro to first step
      setStepVisible(false);
      setTimeout(() => {
        setCurrentStep(0);
        setStepVisible(true);
        setTimeout(() => speakStep(0), 300);
      }, 300);
    } else if (currentStep < tourSteps.length - 1) {
      // Move to next step
      setStepVisible(false);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setStepVisible(true);
        setTimeout(() => speakStep(currentStep + 1), 300);
      }, 300);
    } else {
      // Show follow up
      setStepVisible(false);
      setTimeout(() => {
        setShowFollowUp(true);
        setStepVisible(true);
        if (voiceEnabled) {
          speak(`You can tap any object to open its tools. You're not doing this alone, ${userName}.`);
        }
      }, 300);
    }
  };

  const handleSkip = () => {
    stopSpeaking();
    onHighlightHotspot(null);
    onSkip();
  };

  const handleComplete = () => {
    stopSpeaking();
    onHighlightHotspot(null);
    onComplete();
  };

  const step = currentStep >= 0 ? tourSteps[currentStep] : null;
  const progress = currentStep >= 0 ? ((currentStep + 1) / tourSteps.length) * 100 : 0;

  // Follow-up screen
  if (showFollowUp) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className={cn(
          "bg-card/95 backdrop-blur-xl rounded-3xl border border-border/40 p-8 max-w-md w-full shadow-2xl",
          "transition-all duration-500",
          stepVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}>
          <div className="flex justify-center mb-6">
            <div className={cn(
              "w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center",
              isSpeaking && "animate-pulse"
            )}>
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-center mb-4">
            Your Room is Ready
          </h2>

          <p className="text-center text-foreground/80 mb-6 leading-relaxed">
            You can tap any object to open its tools.<br />
            You're not doing this alone, {userName}.
          </p>

          <Button
            onClick={handleComplete}
            size="lg"
            className="w-full h-14 rounded-2xl text-lg shadow-lg shadow-primary/20"
          >
            Enter My Room
          </Button>
        </div>
      </div>
    );
  }

  // Intro screen
  if (currentStep === -1) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className={cn(
          "bg-card/95 backdrop-blur-xl rounded-3xl border border-border/40 p-8 max-w-md w-full shadow-2xl",
          "transition-all duration-500",
          stepVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}>
          <div className="flex justify-center mb-6">
            <div className={cn(
              "w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center",
              isSpeaking && "animate-pulse"
            )}>
              <BedDouble className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-center mb-4">
            Welcome to Your Room
          </h2>

          <p className="text-center text-foreground/80 mb-6 leading-relaxed">
            This is our home base. I'll show you how each part can help us work together.
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 h-12 rounded-xl text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Skip tour
            </button>
            <Button
              onClick={handleNext}
              className="flex-1 h-12 rounded-xl"
            >
              Show me
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Tour step
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      {/* Voice indicator */}
      <button
        className={cn(
          "absolute top-6 right-6 p-3 rounded-full transition-all z-10",
          "bg-card/60 backdrop-blur-sm border border-border/40",
          "hover:bg-card/80",
          isSpeaking && "animate-pulse"
        )}
        aria-label={voiceEnabled ? "Voice enabled" : "Voice disabled"}
      >
        {voiceEnabled ? (
          <Volume2 className={cn("w-5 h-5", isSpeaking ? "text-primary" : "text-foreground/70")} />
        ) : (
          <VolumeX className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Tour card */}
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
        {step && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                "w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary",
                isSpeaking && "animate-pulse"
              )}>
                {step.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Look at the highlighted</p>
                <p className="font-medium text-foreground">{step.objectLabel}</p>
              </div>
              {isSpeaking && (
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
                  <div className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                </div>
              )}
            </div>

            {/* Content */}
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {step.title}
            </h3>
            <p className="text-foreground/80 text-sm leading-relaxed mb-6">
              {step.description}
            </p>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 h-12 rounded-xl text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Skip tour
          </button>
          <Button
            onClick={handleNext}
            className="flex-1 h-12 rounded-xl"
          >
            {currentStep < tourSteps.length - 1 ? 'Next' : 'Finish'}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Step counter */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          {currentStep + 1} of {tourSteps.length}
        </p>
      </div>
    </div>
  );
};
