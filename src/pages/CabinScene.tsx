import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useSAI } from '@/contexts/SAIContext';
import { FullBodySAI } from '@/components/sai/FullBodySAI';
import { 
  Home, 
  ChevronLeft,
  Flame,
  BookMarked,
  ListChecks,
  Target,
  Clock,
  Check,
  RefreshCw,
  Trophy
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import cabinBg from '@/assets/cozy-cabin-bg.jpg';

/**
 * CabinScene - Recovery tools and structured programs
 * 
 * Purpose: Focused space for recovery work
 * Features:
 * - 12-step program guides
 * - Sobriety/recovery trackers
 * - Daily affirmations
 * - Progress milestones
 */

interface RecoveryTool {
  id: string;
  name: string;
  description: string;
  icon: typeof BookMarked;
}

const RECOVERY_TOOLS: RecoveryTool[] = [
  {
    id: 'daily-reflection',
    name: 'Daily Reflection',
    description: 'A moment to check in with yourself.',
    icon: Clock,
  },
  {
    id: 'steps',
    name: '12 Steps Reference',
    description: 'The foundational steps, always available.',
    icon: ListChecks,
  },
  {
    id: 'progress',
    name: 'My Progress',
    description: 'Track your journey, one day at a time.',
    icon: Target,
  },
  {
    id: 'affirmations',
    name: 'Daily Affirmations',
    description: 'Words of strength and hope.',
    icon: BookMarked,
  },
];

const TWELVE_STEPS = [
  "Admitted powerlessness and unmanageability.",
  "Came to believe a Power greater could restore.",
  "Made a decision to turn over will and life.",
  "Made a searching and fearless moral inventory.",
  "Admitted the exact nature of wrongs.",
  "Were entirely ready for defects to be removed.",
  "Humbly asked for shortcomings to be removed.",
  "Made a list of persons harmed.",
  "Made direct amends where possible.",
  "Continued to take personal inventory.",
  "Sought through prayer and meditation.",
  "Carried this message to others.",
];

const AFFIRMATIONS = [
  "I am worthy of recovery and healing.",
  "Today, I choose progress over perfection.",
  "I am stronger than my cravings.",
  "One day at a time is all I need.",
  "I deserve a life of peace and purpose.",
  "My past does not define my future.",
  "I am not alone in this journey.",
  "Every small step forward matters.",
];

const REFLECTION_PROMPTS = [
  "What am I grateful for today?",
  "What challenge did I face, and how did I handle it?",
  "What can I do differently tomorrow?",
  "Who supported me today?",
  "What step am I working on?",
];

export default function CabinScene() {
  const navigate = useNavigate();
  const { speak, voiceEnabled, isSpeaking } = useVoiceSettings();
  const { userProfile } = useSAI();
  const userName = userProfile?.nickname || 'Friend';
  
  const [currentMessage, setCurrentMessage] = useState("Welcome to the cabin. This is your recovery space.");
  const [showSteps, setShowSteps] = useState(false);
  const [showAffirmations, setShowAffirmations] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [daysCount, setDaysCount] = useState(() => {
    const saved = localStorage.getItem('recovery-days');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [lastCheckIn, setLastCheckIn] = useState(() => {
    return localStorage.getItem('recovery-last-checkin');
  });

  const sayMessage = useCallback(async (message: string) => {
    setCurrentMessage(message);
    if (voiceEnabled) {
      await speak(message);
    }
  }, [voiceEnabled, speak]);

  const handleToolClick = useCallback((toolId: string) => {
    switch (toolId) {
      case 'steps':
        setShowSteps(true);
        sayMessage("The twelve steps. Take them at your own pace.");
        break;
      case 'affirmations':
        setShowAffirmations(true);
        const affirmation = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
        sayMessage(affirmation);
        break;
      case 'daily-reflection':
        setShowReflection(true);
        const prompt = REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)];
        sayMessage(prompt);
        break;
      case 'progress':
        setShowProgress(true);
        sayMessage(`You're at ${daysCount} days. Every single one counts.`);
        break;
    }
  }, [daysCount, sayMessage]);

  const checkInToday = useCallback(() => {
    const today = new Date().toDateString();
    if (lastCheckIn !== today) {
      const newCount = daysCount + 1;
      setDaysCount(newCount);
      setLastCheckIn(today);
      localStorage.setItem('recovery-days', newCount.toString());
      localStorage.setItem('recovery-last-checkin', today);
      sayMessage(`Day ${newCount}. You showed up. That's what matters.`);
    } else {
      sayMessage("You've already checked in today. Keep going.");
    }
  }, [daysCount, lastCheckIn, sayMessage]);

  const resetProgress = useCallback(() => {
    if (confirm('Are you sure you want to reset your progress? This cannot be undone.')) {
      setDaysCount(0);
      setLastCheckIn(null);
      localStorage.removeItem('recovery-days');
      localStorage.removeItem('recovery-last-checkin');
      sayMessage("Progress reset. Every journey has a new beginning.");
    }
  }, [sayMessage]);

  const getNextAffirmation = useCallback(() => {
    const affirmation = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
    sayMessage(affirmation);
  }, [sayMessage]);

  const getMilestone = (days: number) => {
    if (days >= 365) return { label: '1 Year', progress: 100 };
    if (days >= 90) return { label: '90 Days', progress: Math.min(100, (days / 365) * 100) };
    if (days >= 30) return { label: '30 Days', progress: Math.min(100, (days / 90) * 100) };
    if (days >= 7) return { label: '1 Week', progress: Math.min(100, (days / 30) * 100) };
    return { label: '1 Day', progress: Math.min(100, (days / 7) * 100) };
  };

  return (
    <div 
      className="min-h-screen relative flex flex-col"
      style={{
        backgroundImage: `url(${cabinBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 via-transparent to-amber-900/30" />
      
      {/* Header */}
      <header className="relative z-20 bg-card/30 backdrop-blur-sm border-b border-border/20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/sai-home')}
              className="text-foreground/70 hover:text-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span className="font-display font-semibold text-foreground">Cabin</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/sai-home')}
            className="text-foreground/70 hover:text-foreground"
          >
            <Home className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col p-4 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full flex flex-col">
          
          {/* SAI with Message */}
          <div className="flex items-start gap-4 mb-6">
            <FullBodySAI 
              size="md" 
              state={isSpeaking ? 'speaking' : 'attentive'}
            />
            <div className={cn(
              "bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-amber-500/30 flex-1"
            )}>
              <p className="text-foreground text-sm leading-relaxed">
                {currentMessage}
              </p>
            </div>
          </div>

          {/* Daily Check-In Button */}
          <Button
            size="lg"
            className="mb-6 h-14 bg-amber-600 hover:bg-amber-700"
            onClick={checkInToday}
          >
            <Check className="w-5 h-5 mr-2" />
            Check In Today ({daysCount} days)
          </Button>

          {/* Recovery Tools */}
          <div className="grid grid-cols-2 gap-3">
            {RECOVERY_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card
                  key={tool.id}
                  className="bg-card/70 backdrop-blur-sm cursor-pointer hover:bg-card/90 transition-all border-amber-500/30"
                  onClick={() => handleToolClick(tool.id)}
                >
                  <CardHeader className="p-4">
                    <Icon className="w-6 h-6 text-amber-400 mb-2" />
                    <CardTitle className="text-sm">{tool.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          <p className="text-foreground/40 text-xs text-center mt-6">
            One day at a time. The fire keeps burning.
          </p>
        </div>
      </main>

      {/* 12 Steps Sheet */}
      <Sheet open={showSteps} onOpenChange={setShowSteps}>
        <SheetContent className="bg-card border-border overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-amber-400" />
              The 12 Steps
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            {TWELVE_STEPS.map((step, index) => (
              <div 
                key={index}
                className={cn(
                  "p-3 rounded-lg border transition-all cursor-pointer",
                  currentStep === index 
                    ? "bg-amber-500/20 border-amber-500/50" 
                    : "bg-muted/30 border-border/50 hover:bg-muted/50"
                )}
                onClick={() => {
                  setCurrentStep(index);
                  sayMessage(`Step ${index + 1}: ${step}`);
                }}
              >
                <p className="text-sm">
                  <span className="font-semibold text-amber-400 mr-2">{index + 1}.</span>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Affirmations Sheet */}
      <Sheet open={showAffirmations} onOpenChange={setShowAffirmations}>
        <SheetContent className="bg-card border-border">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-amber-400" />
              Daily Affirmations
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
              <p className="text-lg text-center text-foreground italic">
                "{currentMessage}"
              </p>
            </div>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={getNextAffirmation}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Another Affirmation
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Reflection Sheet */}
      <Sheet open={showReflection} onOpenChange={setShowReflection}>
        <SheetContent className="bg-card border-border">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Daily Reflection
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
              <p className="text-foreground text-center">
                {currentMessage}
              </p>
            </div>
            <p className="text-muted-foreground text-sm text-center">
              Take a moment to sit with this question. There's no right or wrong answer.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const prompt = REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)];
                sayMessage(prompt);
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Different Question
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Progress Sheet */}
      <Sheet open={showProgress} onOpenChange={setShowProgress}>
        <SheetContent className="bg-card border-border">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              My Progress
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {/* Day Counter */}
            <div className="text-center">
              <div className="text-5xl font-bold text-amber-400 mb-2">
                {daysCount}
              </div>
              <p className="text-muted-foreground">Days</p>
            </div>

            {/* Next Milestone */}
            <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Next milestone</span>
                <span className="text-foreground">{getMilestone(daysCount).label}</span>
              </div>
              <Progress 
                value={getMilestone(daysCount).progress} 
                className="h-2"
              />
            </div>

            {/* Milestones Achieved */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground/70">Achievements</p>
              {[1, 7, 30, 90, 365].map((milestone) => (
                <div 
                  key={milestone}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg",
                    daysCount >= milestone 
                      ? "bg-amber-500/20 text-foreground" 
                      : "bg-muted/20 text-muted-foreground"
                  )}
                >
                  {daysCount >= milestone ? (
                    <Check className="w-4 h-4 text-amber-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-current" />
                  )}
                  <span className="text-sm">
                    {milestone === 1 ? '1 Day' : 
                     milestone === 7 ? '1 Week' :
                     milestone === 30 ? '30 Days' :
                     milestone === 90 ? '90 Days' : '1 Year'}
                  </span>
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={resetProgress}
            >
              Reset Progress
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}