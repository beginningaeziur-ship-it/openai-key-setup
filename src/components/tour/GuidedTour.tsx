import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThreeChoicePrompt } from '@/components/sai/ThreeChoicePrompt';
import { X, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';

export interface TourStep {
  id: string;
  title: string;
  content: string;
  highlight?: string; // CSS selector for element to highlight
  position?: 'center' | 'top' | 'bottom';
  voiceText?: string; // Text for SAI to speak
}

export interface TourConfig {
  id: string;
  title: string;
  steps: TourStep[];
}

interface GuidedTourProps {
  tour: TourConfig;
  onComplete: () => void;
  onSkip?: () => void;
  saiName?: string;
}

const TOUR_STORAGE_KEY = 'sai_tours_completed';

// Get completed tours from localStorage
export function getCompletedTours(): string[] {
  try {
    const stored = localStorage.getItem(TOUR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Mark a tour as completed
export function markTourCompleted(tourId: string): void {
  const completed = getCompletedTours();
  if (!completed.includes(tourId)) {
    completed.push(tourId);
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(completed));
  }
}

// Check if a tour has been completed
export function isTourCompleted(tourId: string): boolean {
  return getCompletedTours().includes(tourId);
}

// Reset all tours (for testing or settings)
export function resetAllTours(): void {
  localStorage.removeItem(TOUR_STORAGE_KEY);
}

export function GuidedTour({ tour, onComplete, onSkip, saiName = 'SAI' }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { speak, voiceEnabled } = useVoiceSettings();

  const step = tour.steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tour.steps.length - 1;

  // Speak the current step's content
  useEffect(() => {
    if (voiceEnabled && step.voiceText) {
      speak(step.voiceText);
    }
  }, [currentStep, step.voiceText, voiceEnabled, speak]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      markTourCompleted(tour.id);
      setIsVisible(false);
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  }, [isLastStep, tour.id, onComplete]);

  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  }, [isFirstStep]);

  const handleSkip = useCallback(() => {
    markTourCompleted(tour.id);
    setIsVisible(false);
    onSkip?.();
  }, [tour.id, onSkip]);

  const handleThreeChoice = useCallback((choice: string) => {
    if (choice === 'gentle') {
      // Stay on current step, maybe repeat explanation
      if (voiceEnabled && step.voiceText) {
        speak(step.voiceText);
      }
    } else if (choice === 'standard') {
      handleNext();
    } else if (choice === 'challenge') {
      // Skip to end
      markTourCompleted(tour.id);
      setIsVisible(false);
      onComplete();
    }
  }, [handleNext, tour.id, onComplete, voiceEnabled, step.voiceText, speak]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* Tour Card */}
      <Card className={cn(
        'relative z-10 w-full max-w-lg mx-4 p-6 shadow-xl border-primary/20',
        'animate-in fade-in-0 zoom-in-95 duration-300'
      )}>
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8"
          onClick={handleSkip}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* SAI Avatar */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-foreground">{saiName}</span>
              <span className="text-xs text-muted-foreground">
                Step {currentStep + 1} of {tour.steps.length}
              </span>
            </div>
            <h3 className="text-lg font-display font-semibold text-foreground">
              {step.title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-muted-foreground leading-relaxed">
            {step.content}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {tour.steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                index === currentStep ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>

        {/* Three-choice navigation */}
        <ThreeChoicePrompt
          prompt="How would you like to continue?"
          options={[
            {
              id: 'gentle',
              label: 'Explain again',
              description: 'Repeat this explanation',
            },
            {
              id: 'standard',
              label: isLastStep ? 'Got it!' : 'Next',
              description: isLastStep ? 'Finish the tour' : 'Continue to next step',
            },
            {
              id: 'challenge',
              label: 'Skip tour',
              description: "I'll explore on my own",
            },
          ]}
          onSelect={handleThreeChoice}
          variant="compact"
        />

        {/* Alternative navigation buttons */}
        <div className="flex justify-between mt-4 pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            className="gap-1"
          >
            {isLastStep ? 'Finish' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
