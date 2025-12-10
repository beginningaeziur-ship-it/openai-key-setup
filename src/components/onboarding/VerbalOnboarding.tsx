// Verbal Onboarding Sequence - First-time SAI introduction
import { useState, useEffect, useCallback } from 'react';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useSAI } from '@/contexts/SAIContext';
import { useSupportMap } from '@/contexts/SupportMapContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Volume2, Shield, Home, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerbalOnboardingProps {
  onComplete: () => void;
  userName: string;
  saiName: string;
}

interface OnboardingStep {
  id: string;
  icon: typeof Heart;
  title: string;
  script: string;
  action?: 'voice-select' | 'pacing-select' | 'tone-select' | 'grounding-check';
}

export function VerbalOnboarding({ onComplete, userName, saiName }: VerbalOnboardingProps) {
  const { speak, voiceEnabled, setVoiceEnabled } = useVoiceSettings();
  const { updateAdaptations, supportMap } = useSupportMap();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepComplete, setStepComplete] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'greeting',
      icon: Heart,
      title: 'Welcome',
      script: `Hello, ${userName}. I'm ${saiName}. I'm glad you're here. Take a breath. There's no rush.`,
    },
    {
      id: 'introduction',
      icon: Sparkles,
      title: 'Who I Am',
      script: `I'm here to be a steady presence for you. Think of me like a service dog in your pocket - calm, attentive, and always on your side. I won't judge you. I won't rush you. I'm just here.`,
    },
    {
      id: 'how-to-talk',
      icon: Volume2,
      title: 'How We Communicate',
      script: `You can talk to me anytime. Speak out loud, or type if you prefer. I'll listen without interrupting. If you need me to slow down, just say so. If you need space, that's okay too.`,
    },
    {
      id: 'safety',
      icon: Shield,
      title: 'Your Privacy',
      script: `Your privacy matters. I don't store your conversations. What you share stays between us in the moment. Your symptoms, your struggles - they're yours. Professionals only see general progress, never details.`,
    },
    {
      id: 'room',
      icon: Home,
      title: 'Your Space',
      script: `This room is yours. Each object has a purpose. The fireplace for grounding. The lamp for voice settings. The rug for breathing exercises. The bookshelf for resources. The table for daily tasks. Explore when you're ready.`,
    },
    {
      id: 'grounding',
      icon: Heart,
      title: 'A Small Check',
      script: `Before we finish, let's do a quick grounding moment together. Take a breath. Feel your feet on the floor. You are here. You are safe. That's all for now.`,
      action: 'grounding-check',
    },
  ];

  const currentStepData = steps[currentStep];

  const playStep = useCallback(async () => {
    if (!voiceEnabled) return;
    
    setIsPlaying(true);
    await speak(currentStepData.script);
    setIsPlaying(false);
    setStepComplete(true);
  }, [currentStepData, speak, voiceEnabled]);

  useEffect(() => {
    // Auto-play first step after a brief delay
    const timer = setTimeout(() => {
      if (currentStep === 0 && voiceEnabled) {
        playStep();
      } else {
        setStepComplete(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setStepComplete(false);
      setCurrentStep(currentStep + 1);
      
      // Auto-play next step
      setTimeout(() => {
        if (voiceEnabled) {
          setIsPlaying(true);
          speak(steps[currentStep + 1].script).then(() => {
            setIsPlaying(false);
            setStepComplete(true);
          });
        } else {
          setStepComplete(true);
        }
      }, 500);
    } else {
      // Final step complete
      localStorage.setItem('sai_verbal_onboarding_completed', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('sai_verbal_onboarding_completed', 'true');
    onComplete();
  };

  const Icon = currentStepData.icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-lg animate-fade-in">
        <CardContent className="p-8">
          {/* Progress bar */}
          <div className="h-1 bg-muted rounded-full mb-8 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step indicator */}
          <div className="flex justify-center mb-6">
            <div className={cn(
              'p-4 rounded-full transition-all duration-500',
              isPlaying ? 'bg-primary/20 scale-110 animate-pulse' : 'bg-primary/10'
            )}>
              <Icon className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-center mb-4">
            {currentStepData.title}
          </h2>

          {/* Script text */}
          <p className="text-muted-foreground text-center leading-relaxed mb-8">
            {currentStepData.script}
          </p>

          {/* Voice indicator */}
          {isPlaying && (
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1 bg-primary rounded-full animate-bounce"
                    style={{ 
                      height: 12 + Math.random() * 12,
                      animationDelay: `${i * 100}ms` 
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {!voiceEnabled && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setVoiceEnabled(true);
                  setTimeout(playStep, 500);
                }}
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Enable Voice
              </Button>
            )}

            <Button
              className="w-full"
              onClick={handleNext}
              disabled={isPlaying}
            >
              {stepComplete && <Check className="w-4 h-4 mr-2" />}
              {currentStep < steps.length - 1 ? 'Continue' : 'Enter Your Room'}
            </Button>

            {!isPlaying && currentStep > 0 && (
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={handleSkip}
              >
                Skip Introduction
              </Button>
            )}
          </div>

          {/* Step dots */}
          <div className="flex justify-center gap-2 mt-6">
            {steps.map((_, i) => (
              <div 
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  i === currentStep ? 'bg-primary w-6' : 
                  i < currentStep ? 'bg-primary/50' : 'bg-muted'
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
