import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Wind, 
  Eye, 
  Hand, 
  Ear, 
  Heart,
  X,
  ChevronRight,
  RefreshCw,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type GroundingType = 'breathing' | '54321' | 'body_scan' | 'safe_place';

interface GroundingExerciseProps {
  type: GroundingType;
  userName: string;
  onComplete: () => void;
  onDismiss: () => void;
}

export function GroundingExercise({ type, userName, onComplete, onDismiss }: GroundingExerciseProps) {
  const exercises = {
    breathing: <BreathingExercise userName={userName} onComplete={onComplete} />,
    '54321': <FiveFourThreeTwoOne userName={userName} onComplete={onComplete} />,
    body_scan: <BodyScan userName={userName} onComplete={onComplete} />,
    safe_place: <SafePlace userName={userName} onComplete={onComplete} />,
  };

  const titles = {
    breathing: 'Breathing Exercise',
    '54321': '5-4-3-2-1 Grounding',
    body_scan: 'Body Scan',
    safe_place: 'Safe Place',
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary sai-breathe" />
            {titles[type]}
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDismiss}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {exercises[type]}
      </CardContent>
    </Card>
  );
}

// Breathing Exercise (Box Breathing)
function BreathingExercise({ userName, onComplete }: { userName: string; onComplete: () => void }) {
  const [phase, setPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [cycles, setCycles] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);

  const phaseDuration = 4000; // 4 seconds per phase
  const totalCycles = 3;

  const phaseInstructions = {
    inhale: 'Breathe in slowly...',
    hold1: 'Hold gently...',
    exhale: 'Breathe out slowly...',
    hold2: 'Rest...',
  };

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next phase
          setPhase(current => {
            const phases: typeof phase[] = ['inhale', 'hold1', 'exhale', 'hold2'];
            const currentIndex = phases.indexOf(current);
            const nextIndex = (currentIndex + 1) % 4;
            
            if (nextIndex === 0) {
              setCycles(c => c + 1);
            }
            
            return phases[nextIndex];
          });
          return 0;
        }
        return prev + 2;
      });
    }, phaseDuration / 50);

    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (cycles >= totalCycles) {
      setIsActive(false);
      onComplete();
    }
  }, [cycles, onComplete]);

  if (!isActive) {
    return (
      <div className="text-center space-y-4 py-4">
        <p className="text-muted-foreground">
          {cycles >= totalCycles 
            ? `Nice work, ${userName}. How are you feeling now?`
            : `Let's do some box breathing together, ${userName}.`
          }
        </p>
        {cycles < totalCycles ? (
          <Button onClick={() => setIsActive(true)} className="gap-2">
            <Wind className="w-4 h-4" />
            Start Breathing
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-progress-stable">
            <Check className="w-5 h-5" />
            <span className="font-medium">Exercise complete</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <div className={cn(
          "w-24 h-24 mx-auto rounded-full border-4 border-primary flex items-center justify-center transition-all duration-1000",
          phase === 'inhale' && "scale-110",
          phase === 'exhale' && "scale-90"
        )}>
          <Wind className="w-10 h-10 text-primary" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-xl font-medium">{phaseInstructions[phase]}</p>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex justify-center gap-2">
        {[...Array(totalCycles)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-3 h-3 rounded-full",
              i < cycles ? "bg-progress-stable" : "bg-muted"
            )}
          />
        ))}
      </div>

      <Button variant="ghost" size="sm" onClick={() => setIsActive(false)} className="w-full">
        Pause
      </Button>
    </div>
  );
}

// 5-4-3-2-1 Grounding Exercise
function FiveFourThreeTwoOne({ userName, onComplete }: { userName: string; onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);

  const steps = [
    { count: 5, sense: 'SEE', icon: Eye, prompt: 'Name 5 things you can see right now.' },
    { count: 4, sense: 'TOUCH', icon: Hand, prompt: 'Name 4 things you can touch or feel.' },
    { count: 3, sense: 'HEAR', icon: Ear, prompt: 'Name 3 things you can hear.' },
    { count: 2, sense: 'SMELL', icon: Wind, prompt: 'Name 2 things you can smell.' },
    { count: 1, sense: 'TASTE', icon: Heart, prompt: 'Name 1 thing you can taste.' },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      onComplete();
    }
  };

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <div className="space-y-4 py-2">
      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              i === step ? "w-6 bg-primary" : i < step ? "bg-progress-stable" : "bg-muted"
            )}
          />
        ))}
      </div>

      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <span className="text-4xl font-bold text-primary">{currentStep.count}</span>
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <p className="text-lg font-medium">{currentStep.sense}</p>
        <p className="text-muted-foreground">{currentStep.prompt}</p>
      </div>

      <p className="text-sm text-center text-muted-foreground italic">
        Take your time. No rush, {userName}.
      </p>

      <Button onClick={handleNext} className="w-full gap-2">
        {step < steps.length - 1 ? (
          <>
            I'm ready for the next one
            <ChevronRight className="w-4 h-4" />
          </>
        ) : (
          <>
            <Check className="w-4 h-4" />
            I'm done
          </>
        )}
      </Button>
    </div>
  );
}

// Body Scan Exercise
function BodyScan({ userName, onComplete }: { userName: string; onComplete: () => void }) {
  const [step, setStep] = useState(0);
  
  const bodyParts = [
    { part: 'feet', instruction: 'Notice your feet. Are they warm? Cool? Relaxed?' },
    { part: 'legs', instruction: 'Move your attention to your legs. Feel them resting.' },
    { part: 'stomach', instruction: 'Notice your stomach. Let any tension soften.' },
    { part: 'chest', instruction: 'Feel your chest rise and fall with each breath.' },
    { part: 'hands', instruction: 'Notice your hands. Relax your fingers.' },
    { part: 'shoulders', instruction: 'Let your shoulders drop. Release any tightness.' },
    { part: 'face', instruction: 'Soften your jaw. Relax your forehead.' },
  ];

  const handleNext = () => {
    if (step < bodyParts.length - 1) {
      setStep(s => s + 1);
    } else {
      onComplete();
    }
  };

  const progress = ((step + 1) / bodyParts.length) * 100;

  return (
    <div className="space-y-4 py-2">
      <Progress value={progress} className="h-2" />

      <div className="text-center space-y-3 py-4">
        <p className="text-2xl font-medium capitalize">{bodyParts[step].part}</p>
        <p className="text-muted-foreground">{bodyParts[step].instruction}</p>
      </div>

      <Button onClick={handleNext} className="w-full gap-2">
        {step < bodyParts.length - 1 ? (
          <>
            Next
            <ChevronRight className="w-4 h-4" />
          </>
        ) : (
          <>
            <Check className="w-4 h-4" />
            Complete
          </>
        )}
      </Button>
    </div>
  );
}

// Safe Place Visualization
function SafePlace({ userName, onComplete }: { userName: string; onComplete: () => void }) {
  const [step, setStep] = useState(0);

  const prompts = [
    `Close your eyes if that feels okay, ${userName}. Take a slow breath.`,
    "Picture a place where you feel completely safe. Real or imaginary.",
    "What do you see there? Colors, shapes, light?",
    "What sounds are there? Maybe quiet, maybe gentle background sounds.",
    "What does the air feel like? Temperature, texture?",
    "You're safe here. This place is always available to you.",
  ];

  const handleNext = () => {
    if (step < prompts.length - 1) {
      setStep(s => s + 1);
    } else {
      onComplete();
    }
  };

  const progress = ((step + 1) / prompts.length) * 100;

  return (
    <div className="space-y-4 py-2">
      <Progress value={progress} className="h-2" />

      <div className="text-center py-6">
        <p className="text-lg text-muted-foreground italic">"{prompts[step]}"</p>
      </div>

      <Button onClick={handleNext} className="w-full gap-2">
        {step < prompts.length - 1 ? (
          <>
            Continue
            <ChevronRight className="w-4 h-4" />
          </>
        ) : (
          <>
            <Check className="w-4 h-4" />
            I'm ready to come back
          </>
        )}
      </Button>
    </div>
  );
}

// Quick grounding selector
interface GroundingPickerProps {
  userName: string;
  onSelect: (type: GroundingType) => void;
  onDismiss: () => void;
}

export function GroundingPicker({ userName, onSelect, onDismiss }: GroundingPickerProps) {
  const options = [
    { type: 'breathing' as const, label: 'Breathing', icon: Wind, description: 'Slow box breathing' },
    { type: '54321' as const, label: '5-4-3-2-1', icon: Eye, description: 'Use your senses' },
    { type: 'body_scan' as const, label: 'Body Scan', icon: Hand, description: 'Check in with your body' },
    { type: 'safe_place' as const, label: 'Safe Place', icon: Heart, description: 'Visualize somewhere calm' },
  ];

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Need to ground?</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDismiss}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Pick what feels right, {userName}. No pressure.
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {options.map(({ type, label, icon: Icon, description }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className="p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 text-left transition-all"
          >
            <Icon className="w-5 h-5 text-primary mb-1" />
            <p className="font-medium text-sm">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}