import { useState, useEffect, useRef } from 'react';
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
  Pause,
  Volume2,
  VolumeX,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTTS } from '@/hooks/useTTS';

interface GroundingPanelProps {
  onClose: () => void;
  userName: string;
}

type GroundingExercise = 'breathing' | 'breathing_478' | '54321' | 'body_scan' | 'safe_place';
type BreathingPattern = 'box' | '478';

const breathingNarrations = {
  box: {
    intro: "Let's begin box breathing together. Find a comfortable position. We'll breathe in for 4 counts, hold for 4, breathe out for 4, and rest for 4.",
    inhale: "Breathe in slowly... 1... 2... 3... 4...",
    hold: "Hold gently... 1... 2... 3... 4...",
    exhale: "Breathe out slowly... 1... 2... 3... 4...",
    rest: "Rest... 1... 2... 3... 4...",
    complete: "Well done. Take a moment to notice how you feel. You can continue as long as you need."
  },
  '478': {
    intro: "Let's begin 4-7-8 breathing for deeper relaxation. Find a comfortable position. We'll breathe in for 4 counts, hold for 7, and exhale slowly for 8.",
    inhale: "Breathe in through your nose... 1... 2... 3... 4...",
    hold: "Hold your breath gently... 1... 2... 3... 4... 5... 6... 7...",
    exhale: "Exhale slowly through your mouth... 1... 2... 3... 4... 5... 6... 7... 8...",
    complete: "Wonderful. This technique helps calm your nervous system. Take a moment to notice the relaxation."
  }
};

const groundingNarrations = {
  intro: "Let's ground together using your senses. Take your time with each step.",
  5: "Look around you. Name 5 things you can see right now. Take your time.",
  4: "Good. Now notice 4 things you can physically feel. The texture of your clothes, the surface beneath you.",
  3: "Now focus on 3 sounds you can hear. They can be close or far away.",
  2: "Take a breath. Can you notice 2 things you can smell?",
  1: "Finally, notice 1 thing you can taste, even if it's just the inside of your mouth.",
  complete: "You did it. You're here. You're present. Take a moment to notice how your body feels now."
};

const bodyScanNarration = `Close your eyes if that feels safe. We'll slowly move attention through your body, noticing without judgment.

Start at your feet. Notice any sensations there. Warmth, pressure, tingling. Just notice.

Move up to your ankles and calves. What do you feel? There's no right answer.

Now your knees and thighs. Heavy? Light? Tense? Just observe.

Bring attention to your hips and lower back. Breathe gently into any tension.

Notice your belly rising and falling with your breath. Your chest. Your shoulders.

Feel your arms, your hands, your fingers. Any sensations there?

Finally, your neck, your face, the top of your head.

Take a full breath. You are here, in your body, safe in this moment.`;

const safePlaceNarration = `Picture a place where you feel completely safe. It can be real or imagined.

What do you see there? Notice the colors, the shapes, the light.

What sounds are in this place? Maybe it's quiet. Maybe there's gentle background noise.

How does the air feel? Is it warm? Cool? Is there a breeze?

Is there a comfortable spot where you can rest? Go there now in your mind.

You are safe here. Nothing can harm you in this place. You can return here whenever you need.

Take a few deep breaths in this safe space. Feel the peace here.

When you're ready, gently bring your awareness back, knowing you can return anytime.`;

export function GroundingPanel({ onClose, userName }: GroundingPanelProps) {
  const [activeExercise, setActiveExercise] = useState<GroundingExercise | null>(null);
  const [breathPhase, setBreathPhase] = useState<'intro' | 'inhale' | 'hold' | 'exhale' | 'rest'>('intro');
  const [isBreathing, setIsBreathing] = useState(false);
  const [groundingStep, setGroundingStep] = useState(5);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [cycleCount, setCycleCount] = useState(0);
  const [breathingPattern, setBreathingPattern] = useState<BreathingPattern>('box');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { speak, stopAudio, isLoading, isPlaying } = useTTS();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stopAudio();
    };
  }, [stopAudio]);

  const startBreathing = async (pattern: BreathingPattern = 'box') => {
    setBreathingPattern(pattern);
    setIsBreathing(true);
    setBreathPhase('intro');
    setCycleCount(0);
    
    const narrations = breathingNarrations[pattern];
    
    // Speak intro
    if (voiceEnabled) {
      await speak(narrations.intro);
    }
    
    // Wait for intro to finish, then start cycle
    setTimeout(() => {
      runBreathingCycle(pattern);
    }, voiceEnabled ? 8000 : 1000);
  };

  const runBreathingCycle = (pattern: BreathingPattern) => {
    // Box breathing: 4-4-4-4 (inhale, hold, exhale, rest)
    // 4-7-8 breathing: 4-7-8 (inhale, hold, exhale) - no rest phase
    const phases: Array<'inhale' | 'hold' | 'exhale' | 'rest'> = 
      pattern === '478' ? ['inhale', 'hold', 'exhale'] : ['inhale', 'hold', 'exhale', 'rest'];
    
    // Timing in seconds for each phase
    const timings = pattern === '478' 
      ? { inhale: 4000, hold: 7000, exhale: 8000 }
      : { inhale: 4000, hold: 4000, exhale: 4000, rest: 4000 };
    
    let phaseIndex = 0;
    const narrations = breathingNarrations[pattern];

    const advancePhase = async () => {
      const currentPhase = phases[phaseIndex];
      setBreathPhase(currentPhase);
      
      if (voiceEnabled && narrations[currentPhase]) {
        speak(narrations[currentPhase]);
      }
      
      const currentTiming = timings[currentPhase];
      phaseIndex = (phaseIndex + 1) % phases.length;
      
      if (phaseIndex === 0) {
        setCycleCount(prev => prev + 1);
      }
      
      // Schedule next phase with appropriate timing
      intervalRef.current = setTimeout(advancePhase, currentTiming);
    };

    advancePhase();
  };

  const stopBreathing = () => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    setIsBreathing(false);
    setBreathPhase('intro');
    stopAudio();
    
    if (voiceEnabled && cycleCount > 0) {
      speak(breathingNarrations[breathingPattern].complete);
    }
  };

  const handleGroundingStep = async () => {
    const newStep = Math.max(0, groundingStep - 1);
    setGroundingStep(newStep);
    
    if (voiceEnabled && newStep > 0) {
      speak(groundingNarrations[newStep as keyof typeof groundingNarrations] as string);
    } else if (voiceEnabled && newStep === 0) {
      speak(groundingNarrations.complete);
    }
  };

  const startGrounding = async () => {
    setGroundingStep(5);
    if (voiceEnabled) {
      await speak(groundingNarrations.intro);
      setTimeout(() => speak(groundingNarrations[5]), 3000);
    }
  };

  const startBodyScan = async () => {
    if (voiceEnabled) {
      speak(bodyScanNarration);
    }
  };

  const startSafePlace = async () => {
    if (voiceEnabled) {
      speak(safePlaceNarration);
    }
  };

  const exercises = [
    { 
      id: 'breathing' as GroundingExercise, 
      label: 'Box Breathing', 
      icon: Wind,
      description: '4-4-4-4: Balanced calm'
    },
    { 
      id: 'breathing_478' as GroundingExercise, 
      label: '4-7-8 Breathing', 
      icon: Wind,
      description: 'Deep relaxation pattern'
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

  const handleExerciseSelect = (id: GroundingExercise) => {
    setActiveExercise(id);
    if (id === '54321') {
      startGrounding();
    } else if (id === 'body_scan') {
      startBodyScan();
    } else if (id === 'safe_place') {
      startSafePlace();
    } else if (id === 'breathing_478') {
      // Auto-start 4-7-8 breathing when selected
    }
  };

  const handleBack = () => {
    stopBreathing();
    stopAudio();
    setActiveExercise(null);
    setGroundingStep(5);
  };

  const handleClose = () => {
    stopBreathing();
    stopAudio();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card border-primary/20 shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-foreground">
              Grounding Corner
            </h2>
            <div className="flex items-center gap-2">
              {/* Voice toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setVoiceEnabled(!voiceEnabled);
                  if (voiceEnabled) stopAudio();
                }}
                className={cn(
                  voiceEnabled ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : voiceEnabled ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Voice status indicator */}
          {voiceEnabled && (isLoading || isPlaying) && (
            <div className="flex items-center justify-center gap-2 mb-4 text-sm text-primary">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1 h-3 bg-primary rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span>SAI is speaking...</span>
            </div>
          )}

          {!activeExercise ? (
            /* Exercise selection */
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {voiceEnabled ? 'Voice guidance is on. Tap the speaker to turn it off.' : 'Voice guidance is off.'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {exercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => handleExerciseSelect(ex.id)}
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
            </div>
          ) : activeExercise === 'breathing' || activeExercise === 'breathing_478' ? (
            /* Breathing Exercises (Box or 4-7-8) */
            <div className="flex flex-col items-center py-8">
              <h3 className="text-lg font-display font-semibold mb-4">
                {activeExercise === 'breathing_478' ? '4-7-8 Breathing' : 'Box Breathing'}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {activeExercise === 'breathing_478' 
                  ? 'Inhale 4s → Hold 7s → Exhale 8s (deeper relaxation)'
                  : 'Inhale 4s → Hold 4s → Exhale 4s → Rest 4s'
                }
              </p>
              
              <div className={cn(
                'w-40 h-40 rounded-full flex items-center justify-center',
                'border-4 transition-all duration-1000',
                !isBreathing && 'border-primary/50',
                breathPhase === 'inhale' && 'scale-125 border-primary bg-primary/10',
                breathPhase === 'hold' && 'scale-125 border-primary bg-primary/20',
                breathPhase === 'exhale' && 'scale-100 border-primary/50',
                breathPhase === 'rest' && 'scale-100 border-primary/30',
              )}>
                <div className="text-center">
                  <span className="text-2xl font-display font-bold text-primary capitalize">
                    {isBreathing ? (breathPhase === 'intro' ? 'Ready...' : breathPhase) : 'Ready'}
                  </span>
                  {isBreathing && cycleCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Cycle {cycleCount}</p>
                  )}
                </div>
              </div>
              
              <p className="text-muted-foreground mt-6 text-center max-w-xs">
                {isBreathing
                  ? breathPhase === 'intro' 
                    ? 'Preparing...'
                    : `${breathPhase === 'inhale' ? 'Breathe in slowly...' : breathPhase === 'hold' ? 'Hold gently...' : breathPhase === 'exhale' ? 'Breathe out slowly...' : 'Rest...'}`
                  : 'Press start when ready. We\'ll breathe together.'
                }
              </p>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  onClick={() => {
                    if (isBreathing) {
                      stopBreathing();
                    } else {
                      startBreathing(activeExercise === 'breathing_478' ? '478' : 'box');
                    }
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : isBreathing ? (
                    <Pause className="w-4 h-4 mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {isBreathing ? 'Stop' : 'Start'}
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
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  onClick={handleGroundingStep}
                  disabled={groundingStep === 0 || isLoading}
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {groundingStep === 0 ? 'Complete' : `Done with ${groundingStep}`}
                </Button>
              </div>

              {groundingStep === 0 && (
                <p className="text-center text-progress-stable font-medium">
                  You did it. Take a moment to notice how you feel now.
                </p>
              )}
            </div>
          ) : (
            /* Body Scan and Safe Place */
            <div className="text-center py-8 space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center sai-breathe">
                {activeExercise === 'body_scan' ? (
                  <Hand className="w-10 h-10 text-primary" />
                ) : (
                  <Heart className="w-10 h-10 text-primary" />
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-display font-semibold text-lg">
                  {activeExercise === 'body_scan' ? 'Body Scan' : 'Safe Place Visualization'}
                </h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  {voiceEnabled 
                    ? 'SAI will guide you through this exercise. Close your eyes and listen.'
                    : activeExercise === 'body_scan'
                      ? 'Close your eyes. Starting at your feet, notice any sensations without judgment. Move slowly up through your body.'
                      : 'Picture a place where you feel completely safe. It can be real or imagined. Notice what you see, hear, and feel there.'
                  }
                </p>
              </div>

              {isPlaying && (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-4 bg-primary rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                {voiceEnabled && !isPlaying && (
                  <Button 
                    onClick={() => activeExercise === 'body_scan' ? startBodyScan() : startSafePlace()}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                    Play Again
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
