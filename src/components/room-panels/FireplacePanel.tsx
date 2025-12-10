// Fireplace Panel - Grounding + Emotional Soothing Tools
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useServiceDog } from '@/contexts/ServiceDogContext';
import { Flame, Wind, Heart, Sparkles, Moon, Dog } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FireplacePanelProps {
  open: boolean;
  onClose: () => void;
  userName?: string;
}

const groundingExercises = [
  {
    id: 'breathing',
    title: 'Box Breathing',
    icon: Wind,
    description: 'Inhale 4s, hold 4s, exhale 4s, hold 4s',
    script: `Let's breathe together. Breathe in... 2, 3, 4. Hold... 2, 3, 4. Breathe out... 2, 3, 4. Hold... 2, 3, 4. You're doing great.`,
  },
  {
    id: '54321',
    title: '5-4-3-2-1 Senses',
    icon: Sparkles,
    description: 'Ground through your senses',
    script: `Name 5 things you can see. 4 things you can touch. 3 things you can hear. 2 things you can smell. 1 thing you can taste. Take your time.`,
  },
  {
    id: 'warmth',
    title: 'Warmth Visualization',
    icon: Flame,
    description: 'Imagine warmth spreading through you',
    script: `Imagine a warm, golden light starting in your chest. Feel it gently spreading through your shoulders, down your arms, to your fingertips. Let it flow down your spine, through your legs, to your toes. You are warm. You are safe.`,
  },
  {
    id: 'safe-place',
    title: 'Safe Place',
    icon: Moon,
    description: 'Visit your mental safe space',
    script: `Close your eyes if that feels okay. Picture a place where you feel completely safe. It could be real or imagined. Notice the colors, the sounds, the feeling of being there. You can come here anytime you need to.`,
  },
];

export function FireplacePanel({ open, onClose, userName = 'Friend' }: FireplacePanelProps) {
  const { speak, voiceEnabled } = useVoiceSettings();
  const { dogModeEnabled, getDogGroundingPrompt, dogState } = useServiceDog();
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleExercise = async (exercise: typeof groundingExercises[0]) => {
    setActiveExercise(exercise.id);
    setIsPlaying(true);
    
    if (voiceEnabled) {
      await speak(exercise.script);
    }
    
    setIsPlaying(false);
  };

  const handleDogGrounding = async () => {
    if (!dogModeEnabled) return;
    
    const prompt = getDogGroundingPrompt();
    setActiveExercise('dog');
    setIsPlaying(true);
    
    if (voiceEnabled) {
      await speak(prompt);
    }
    
    setIsPlaying(false);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orange-500/20">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <SheetTitle>Grounding & Soothing</SheetTitle>
              <SheetDescription>
                Tools to help you feel calm and present
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-4">
          {/* Service Dog Option */}
          {dogModeEnabled && (
            <Card 
              className={cn(
                'cursor-pointer transition-all hover:shadow-md border-2',
                activeExercise === 'dog' ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20' : 'border-transparent'
              )}
              onClick={handleDogGrounding}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/20">
                    <Dog className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium flex items-center gap-2">
                      {dogState.name}'s Comfort
                      <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
                        {dogState.mood}
                      </span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Let your companion help ground you
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grounding Exercises */}
          {groundingExercises.map((exercise) => {
            const Icon = exercise.icon;
            const isActive = activeExercise === exercise.id;
            
            return (
              <Card 
                key={exercise.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md border-2',
                  isActive ? 'border-primary bg-primary/5' : 'border-transparent',
                  isPlaying && isActive && 'animate-pulse'
                )}
                onClick={() => handleExercise(exercise)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'p-3 rounded-xl',
                      isActive ? 'bg-primary/20' : 'bg-muted'
                    )}>
                      <Icon className={cn(
                        'w-6 h-6',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      )} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{exercise.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {exercise.description}
                      </p>
                    </div>
                    {isPlaying && isActive && (
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-4 bg-primary rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-6 bg-primary rounded animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-4 bg-primary rounded animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Comfort</h4>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => speak("You are safe. You are here. This moment will pass.")}
            >
              <Heart className="w-4 h-4 mr-1" />
              Reassurance
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => speak("Take a deep breath with me. In... and out. Good.")}
            >
              <Wind className="w-4 h-4 mr-1" />
              Quick Breath
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
