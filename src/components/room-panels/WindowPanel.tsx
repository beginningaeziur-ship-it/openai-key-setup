// Window Panel - Look Outside (Visual Grounding, Perspective)
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { CloudRain, Eye, Mountain, Sunrise, Stars, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WindowPanelProps {
  open: boolean;
  onClose: () => void;
  userName?: string;
}

const perspectives = [
  {
    id: 'rain',
    title: 'Watch the Rain',
    icon: CloudRain,
    description: 'Focus on each drop. Let your thoughts slow down.',
    script: "Watch the rain. Each drop follows its path. You don't control it. You just watch. Let your thoughts do the same — come, go, without holding on.",
  },
  {
    id: 'horizon',
    title: 'Find the Horizon',
    icon: Mountain,
    description: 'Imagine looking far beyond this moment.',
    script: "Imagine looking at the horizon. Far away, where the sky meets the earth. This moment is small compared to that distance. There's more ahead of you.",
  },
  {
    id: 'sunrise',
    title: 'Sunrise Reminder',
    icon: Sunrise,
    description: 'Every day begins again.',
    script: "The sun rises every day. No matter what happened yesterday, today begins fresh. You get another chance. Every single day.",
  },
  {
    id: 'stars',
    title: 'Night Sky Perspective',
    icon: Stars,
    description: 'You are part of something vast.',
    script: "Look up at the night sky. Those stars have been there for billions of years. Your problems are real, but they're small in the grand scheme. That's not dismissive — it's freeing.",
  },
  {
    id: 'breath',
    title: 'Window Breathing',
    icon: Wind,
    description: 'Breathe with the world outside.',
    script: "Imagine the window open. Fresh air coming in. Breathe in slowly, as if you're drawing in that cool, clean air. Breathe out, letting the stale air leave. In... and out.",
  },
];

export function WindowPanel({ open, onClose, userName = 'Friend' }: WindowPanelProps) {
  const { speak, voiceEnabled, isSpeaking } = useVoiceSettings();
  const [activeExercise, setActiveExercise] = useState<string | null>(null);

  const handleExercise = async (exercise: typeof perspectives[0]) => {
    setActiveExercise(exercise.id);
    if (voiceEnabled) {
      await speak(exercise.script);
    }
    setActiveExercise(null);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-sky-500/20">
              <Eye className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <SheetTitle>Look Outside</SheetTitle>
              <SheetDescription>
                Visual grounding and perspective exercises
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Rain visualization */}
        <Card className="mb-6 overflow-hidden">
          <div className="relative h-32 bg-gradient-to-b from-[#1a2030] via-[#252838] to-[#1f2535]">
            {/* Rain effect */}
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-[1px] bg-gradient-to-b from-transparent via-[#6080a0]/40 to-transparent animate-rain"
                style={{
                  left: `${(i * 3.3)}%`,
                  height: `${20 + Math.random() * 30}%`,
                  top: `${-10 - Math.random() * 20}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${0.6 + Math.random() * 0.3}s`,
                }}
              />
            ))}
            {/* Moon */}
            <div className="absolute top-4 right-8 w-6 h-6 bg-[#e8e4d8]/60 rounded-full blur-[1px]" />
          </div>
        </Card>

        {/* Perspective exercises */}
        <div className="space-y-3">
          {perspectives.map((exercise) => {
            const Icon = exercise.icon;
            const isActive = activeExercise === exercise.id;
            
            return (
              <Card 
                key={exercise.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md border-2',
                  isActive ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20' : 'border-transparent',
                  isSpeaking && isActive && 'animate-pulse'
                )}
                onClick={() => handleExercise(exercise)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'p-3 rounded-xl',
                      isActive ? 'bg-sky-500/20' : 'bg-muted'
                    )}>
                      <Icon className={cn(
                        'w-5 h-5',
                        isActive ? 'text-sky-400' : 'text-muted-foreground'
                      )} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{exercise.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {exercise.description}
                      </p>
                    </div>
                    {isSpeaking && isActive && (
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-4 bg-sky-500 rounded animate-bounce" />
                        <div className="w-1 h-6 bg-sky-500 rounded animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-4 bg-sky-500 rounded animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <style>{`
          @keyframes rain {
            0% { transform: translateY(-100%); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(400%); opacity: 0; }
          }
          .animate-rain { animation: rain linear infinite; }
        `}</style>
      </SheetContent>
    </Sheet>
  );
}
