import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FullBodySAI } from '@/components/sai/FullBodySAI';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useServiceDog } from '@/contexts/ServiceDogContext';
import { useSAI } from '@/contexts/SAIContext';
import { UtensilsCrossed, Droplets, TreePine, Heart, ArrowRight } from 'lucide-react';
import cozyBedroomBg from '@/assets/cozy-bedroom-bg.jpg';

/**
 * PlayRoom - Introduction to SAI dog care
 * 
 * After onboarding, user learns to care for SAI: feed, water, let outside
 * No punishment for forgotten tasks - only praise when remembered
 * SAI always speaks, trauma-informed responses
 */

interface CareTask {
  id: 'food' | 'water' | 'outside';
  label: string;
  icon: typeof UtensilsCrossed;
  completed: boolean;
  saiPrompt: string;
  saiPraise: string;
}

const INTRO_MESSAGES = [
  "Welcome to your safe place.",
  "Before we go inside, there's something important I want to share with you.",
  "I'm not just here to guide you — I'm here to be with you.",
  "Taking care of me helps you take care of yourself.",
  "When you feed me, you're reminded to nourish yourself.",
  "When you give me water, you remember your own thirst.",
  "When you take me outside, we both get fresh air.",
  "Let's start together. Would you like to help me with my first meal?"
];

const CARE_TASKS: CareTask[] = [
  {
    id: 'food',
    label: 'Feed SAI',
    icon: UtensilsCrossed,
    completed: false,
    saiPrompt: "I could use some food. Would you help me?",
    saiPraise: "Thank you. That felt good. Have you eaten today?"
  },
  {
    id: 'water',
    label: 'Give Water',
    icon: Droplets,
    completed: false,
    saiPrompt: "I'm a little thirsty. Can you help me get water?",
    saiPraise: "Ahh, refreshing. Remember to drink some water yourself."
  },
  {
    id: 'outside',
    label: 'Go Outside',
    icon: TreePine,
    completed: false,
    saiPrompt: "I'd love some fresh air. Can we step outside together?",
    saiPraise: "That breeze felt nice. It's good for both of us to breathe."
  }
];

export default function PlayRoom() {
  const navigate = useNavigate();
  const { speak, isSpeaking, voiceEnabled } = useVoiceSettings();
  const { fulfillNeed, dogState } = useServiceDog();
  const { userProfile } = useSAI();
  
  const saiName = userProfile?.saiNickname || 'SAI';
  
  const [phase, setPhase] = useState<'intro' | 'care' | 'complete'>('intro');
  const [introIndex, setIntroIndex] = useState(0);
  const [tasks, setTasks] = useState<CareTask[]>(CARE_TASKS);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [showContinue, setShowContinue] = useState(false);
  
  const hasSpokenRef = useRef<Set<number | string>>(new Set());

  // Speak intro messages sequentially
  const speakIntro = useCallback(async () => {
    const text = INTRO_MESSAGES[introIndex];
    if (!text) return;
    
    if (!hasSpokenRef.current.has(`intro-${introIndex}`)) {
      hasSpokenRef.current.add(`intro-${introIndex}`);
      
      if (voiceEnabled) {
        await speak(text);
      }
      
      if (introIndex < INTRO_MESSAGES.length - 1) {
        setTimeout(() => setIntroIndex(prev => prev + 1), 800);
      } else {
        setTimeout(() => setPhase('care'), 1000);
      }
    }
  }, [introIndex, speak, voiceEnabled]);

  useEffect(() => {
    if (phase === 'intro') {
      speakIntro();
    }
  }, [phase, introIndex, speakIntro]);

  // Speak care task prompts
  useEffect(() => {
    if (phase === 'care') {
      const task = tasks[currentTaskIndex];
      if (task && !task.completed && !hasSpokenRef.current.has(`task-${task.id}`)) {
        hasSpokenRef.current.add(`task-${task.id}`);
        if (voiceEnabled) {
          speak(task.saiPrompt);
        }
      }
    }
  }, [phase, currentTaskIndex, tasks, voiceEnabled, speak]);

  // Handle care action
  const handleCareAction = useCallback(async (taskId: 'food' | 'water' | 'outside') => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    const task = tasks[taskIndex];
    
    // Mark as completed
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: true } : t
    ));
    
    // Fulfill the need in context
    if (taskId === 'outside') {
      fulfillNeed('movement');
    } else {
      fulfillNeed(taskId);
    }
    
    // Speak praise
    if (voiceEnabled) {
      await speak(task.saiPraise);
    }
    
    // Move to next task or complete
    const nextIncomplete = tasks.findIndex((t, i) => i > taskIndex && !t.completed);
    if (nextIncomplete !== -1) {
      setCurrentTaskIndex(nextIncomplete);
    } else {
      // All tasks done
      setTimeout(() => setPhase('complete'), 500);
    }
  }, [tasks, fulfillNeed, voiceEnabled, speak]);

  // Complete phase message
  useEffect(() => {
    if (phase === 'complete' && !hasSpokenRef.current.has('complete')) {
      hasSpokenRef.current.add('complete');
      const message = "You did beautifully. Taking care of me is taking care of yourself. Let's go home now.";
      if (voiceEnabled) {
        speak(message);
      }
      setTimeout(() => setShowContinue(true), 2000);
    }
  }, [phase, voiceEnabled, speak]);

  const handleContinue = () => {
    // Mark play room as completed
    localStorage.setItem('sai_playroom_completed', 'true');
    navigate('/onboarding/home-entrance');
  };

  const saiState = isSpeaking ? 'speaking' : 'attentive';
  const currentTask = phase === 'care' ? tasks[currentTaskIndex] : null;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${cozyBedroomBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto text-center">
        {/* Full body SAI */}
        <div className="mb-6">
          <FullBodySAI 
            size="xl" 
            state={saiState}
            showBreathing={phase !== 'care'}
          />
        </div>

        {/* SAI speech bubble */}
        <div className="bg-card/90 backdrop-blur-sm rounded-xl p-6 mb-6 border border-border/50 max-w-md">
          <p className="text-foreground text-lg leading-relaxed">
            {phase === 'intro' && INTRO_MESSAGES[introIndex]}
            {phase === 'care' && currentTask && (
              currentTask.completed ? currentTask.saiPraise : currentTask.saiPrompt
            )}
            {phase === 'complete' && "You did beautifully. Taking care of me is taking care of yourself."}
            {isSpeaking && <span className="animate-pulse ml-1">|</span>}
          </p>
        </div>

        {/* Care actions */}
        {phase === 'care' && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {tasks.map((task, index) => {
              const Icon = task.icon;
              const isActive = index === currentTaskIndex && !task.completed;
              
              return (
                <Button
                  key={task.id}
                  variant={task.completed ? "secondary" : isActive ? "default" : "outline"}
                  size="lg"
                  className={cn(
                    "h-24 flex-col gap-2 transition-all",
                    task.completed && "opacity-60 cursor-default",
                    isActive && "ring-2 ring-primary ring-offset-2 animate-gentle-glow"
                  )}
                  onClick={() => !task.completed && handleCareAction(task.id)}
                  disabled={task.completed || isSpeaking}
                >
                  <Icon className={cn(
                    "w-8 h-8",
                    task.completed && "text-primary"
                  )} />
                  <span className="text-sm">{task.label}</span>
                  {task.completed && (
                    <Heart className="w-4 h-4 text-primary fill-primary absolute top-2 right-2" />
                  )}
                </Button>
              );
            })}
          </div>
        )}

        {/* Progress indicator */}
        {phase === 'care' && (
          <div className="flex items-center gap-2 text-sm text-foreground/70 mb-4">
            <span>{completedCount} of {tasks.length} care tasks completed</span>
          </div>
        )}

        {/* Continue button */}
        {phase === 'complete' && showContinue && (
          <Button
            size="lg"
            className="gap-2 animate-fade-in"
            onClick={handleContinue}
          >
            Enter Your Safe Home
            <ArrowRight className="w-5 h-5" />
          </Button>
        )}

        {/* Gentle reminder - no pressure */}
        {phase === 'care' && (
          <p className="text-foreground/50 text-xs mt-4 max-w-sm">
            Take your time. There's no rush, no wrong way to do this. 
            {saiName} is patient.
          </p>
        )}
      </div>
    </div>
  );
}
