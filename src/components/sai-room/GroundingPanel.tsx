import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Wind, 
  Eye, 
  Hand, 
  Ear, 
  Heart,
  X,
  Play,
  Pause
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GroundingPanelProps {
  onClose: () => void;
  userName: string;
}

type GroundingExercise = 'breathing' | '54321' | 'body_scan' | 'safe_place';

export function GroundingPanel({ onClose, userName }: GroundingPanelProps) {
  const [activeExercise, setActiveExercise] = useState<GroundingExercise | null>(null);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [isBreathing, setIsBreathing] = useState(false);
  const [groundingStep, setGroundingStep] = useState(5);

  const startBreathing = () => {
    setIsBreathing(true);
    setBreathPhase('inhale');
    
    // Box breathing: 4-4-4-4
    const cycle = () => {
      setBreathPhase('inhale');
      setTimeout(() => setBreathPhase('hold'), 4000);
      setTimeout(() => setBreathPhase('exhale'), 8000);
      setTimeout(() => setBreathPhase('rest'), 12000);
    };
    
    cycle();
    const interval = setInterval(cycle, 16000);
    
    // Store interval ID for cleanup
    return () => clearInterval(interval);
  };

  const exercises = [
    { 
      id: 'breathing' as GroundingExercise, 
      label: 'Box Breathing', 
      icon: Wind,
      description: '4 counts in, hold, out, rest'
    },
    { 
      id: '54321' as GroundingExercise, 
      label: '5-4-3-2-1', 
      icon: Eye,
      description: 'Ground through your senses'
    },
    { 
      id: 'body_scan' as GroundingExercise, 
      label: 'Body Scan', 
      icon: Hand,
      description: 'Notice sensations gently'
    },
    { 
      id: 'safe_place' as GroundingExercise, 
      label: 'Safe Place', 
      icon: Heart,
      description: 'Visualize safety'
    },
  ];

  const sensoryPrompts = [
    { count: 5, sense: 'SEE', prompt: 'Name 5 things you can see right now', icon: Eye },
    { count: 4, sense: 'TOUCH', prompt: 'Name 4 things you can feel', icon: Hand },
    { count: 3, sense: 'HEAR', prompt: 'Name 3 things you can hear', icon: Ear },
    { count: 2, sense: 'SMELL', prompt: 'Name 2 things you can smell', icon: Wind },
    { count: 1, sense: 'TASTE', prompt: 'Name 1 thing you can taste', icon: Heart },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card border-primary/20 shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-foreground">
              Grounding Corner
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {!activeExercise ? (
            /* Exercise selection */
            <div className="grid grid-cols-2 gap-3">
              {exercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setActiveExercise(ex.id)}
                  className={cn(
                    'flex flex-col items-center p-4 rounded-xl',
                    'bg-muted/50 border border-border/50',
                    'transition-all duration-200 hover:bg-primary/10 hover:border-primary/30',
                    'hover:scale-105'
                  )}
                >
                  <ex.icon className="w-8 h-8 text-primary mb-2" />
                  <span className="font-medium text-sm">{ex.label}</span>
                  <span className="text-xs text-muted-foreground mt-1">{ex.description}</span>
                </button>
              ))}
            </div>
          ) : activeExercise === 'breathing' ? (
            /* Box Breathing */
            <div className="flex flex-col items-center py-8">
              <div className={cn(
                'w-40 h-40 rounded-full flex items-center justify-center',
                'border-4 border-primary/50 transition-all duration-1000',
                breathPhase === 'inhale' && 'scale-125 border-primary',
                breathPhase === 'hold' && 'scale-125 border-primary',
                breathPhase === 'exhale' && 'scale-100 border-primary/30',
                breathPhase === 'rest' && 'scale-100 border-primary/30',
              )}>
                <span className="text-2xl font-display font-bold text-primary capitalize">
                  {isBreathing ? breathPhase : 'Ready'}
                </span>
              </div>
              
              <p className="text-muted-foreground mt-6 text-center">
                {isBreathing
                  ? `${breathPhase === 'inhale' ? 'Breathe in...' : breathPhase === 'hold' ? 'Hold...' : breathPhase === 'exhale' ? 'Breathe out...' : 'Rest...'}`
                  : 'Press start when ready'
                }
              </p>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setActiveExercise(null)}
                >
                  Back
                </Button>
                <Button
                  onClick={() => {
                    if (isBreathing) {
                      setIsBreathing(false);
                    } else {
                      startBreathing();
                    }
                  }}
                >
                  {isBreathing ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isBreathing ? 'Pause' : 'Start'}
                </Button>
              </div>
            </div>
          ) : activeExercise === '54321' ? (
            /* 5-4-3-2-1 Grounding */
            <div className="space-y-6">
              <p className="text-center text-muted-foreground">
                Ground yourself through your senses, {userName}.
              </p>

              <div className="space-y-4">
                {sensoryPrompts.map((prompt) => (
                  <div
                    key={prompt.count}
                    className={cn(
                      'p-4 rounded-xl border transition-all duration-300',
                      groundingStep === prompt.count
                        ? 'bg-primary/10 border-primary/50'
                        : groundingStep < prompt.count
                          ? 'bg-muted/30 border-border/30 opacity-50'
                          : 'bg-progress-stable/10 border-progress-stable/30'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        groundingStep === prompt.count ? 'bg-primary/20' : 'bg-muted'
                      )}>
                        <span className="font-bold text-lg">{prompt.count}</span>
                      </div>
                      <div>
                        <span className="font-medium text-sm">{prompt.sense}</span>
                        <p className="text-xs text-muted-foreground">{prompt.prompt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setActiveExercise(null)}>
                  Back
                </Button>
                <Button
                  onClick={() => setGroundingStep(Math.max(0, groundingStep - 1))}
                  disabled={groundingStep === 0}
                >
                  Done with {groundingStep}
                </Button>
              </div>

              {groundingStep === 0 && (
                <p className="text-center text-progress-stable font-medium">
                  You did it. Take a moment to notice how you feel now.
                </p>
              )}
            </div>
          ) : (
            /* Other exercises - placeholder */
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {activeExercise === 'body_scan' 
                  ? 'Close your eyes. Starting at your feet, notice any sensations without judgment...'
                  : 'Picture a place where you feel completely safe. It can be real or imagined...'
                }
              </p>
              <Button variant="outline" onClick={() => setActiveExercise(null)}>
                Back
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
