// Bed Panel - Rest & Grounding Tools
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { BedDouble, Wind, Heart, Moon, Waves, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BedPanelProps {
  open: boolean;
  onClose: () => void;
  userName?: string;
}

const restTools = [
  {
    id: 'box-breathing',
    title: 'Box Breathing',
    icon: Wind,
    description: 'Inhale 4s, hold 4s, exhale 4s, hold 4s',
    script: `Let's breathe together. Breathe in slowly... 2, 3, 4. Hold gently... 2, 3, 4. Breathe out slowly... 2, 3, 4. Hold... 2, 3, 4. You're doing great. Let's do another round.`,
  },
  {
    id: 'body-scan',
    title: 'Body Scan',
    icon: Waves,
    description: 'Gentle awareness through your body',
    script: `Close your eyes if that feels okay. Start at your feet. Notice any tension there. Breathe into it. Now move up to your calves... your thighs... your belly. Let each part soften. Your chest... your shoulders... let them drop. Your face... your jaw. You're safe here.`,
  },
  {
    id: 'rest-mode',
    title: 'Rest Mode',
    icon: Moon,
    description: 'Permission to just be still',
    script: `You don't need to do anything right now. You don't need to solve anything. You don't need to be productive. Just rest. Just breathe. This moment is enough.`,
  },
  {
    id: 'safe-place',
    title: 'Safe Place Visualization',
    icon: Heart,
    description: 'Visit your mental sanctuary',
    script: `Picture a place where you feel completely safe. It could be real or imagined. Notice the colors, the sounds, the feeling of being there. This is your sanctuary. You can come here anytime you need to.`,
  },
  {
    id: 'eye-relaxation',
    title: 'Eye Relaxation',
    icon: Eye,
    description: 'Soften your gaze and release tension',
    script: `Soften your gaze. Let your eyes close gently. Feel the weight of your eyelids. Notice the darkness behind your eyes. Let your eyes rest in their sockets. No need to look at anything. Just rest.`,
  },
];

export function BedPanel({ open, onClose, userName = 'Friend' }: BedPanelProps) {
  const { speak, voiceEnabled, isSpeaking } = useVoiceSettings();
  const [activeExercise, setActiveExercise] = useState<string | null>(null);

  const handleExercise = async (exercise: typeof restTools[0]) => {
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
            <div className="p-3 rounded-xl bg-indigo-500/20">
              <BedDouble className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <SheetTitle>Rest & Grounding</SheetTitle>
              <SheetDescription>
                Breathing exercises, body scans, and rest tools
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-4">
          {restTools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeExercise === tool.id;
            
            return (
              <Card 
                key={tool.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md border-2',
                  isActive ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20' : 'border-transparent',
                  isSpeaking && isActive && 'animate-pulse'
                )}
                onClick={() => handleExercise(tool)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'p-3 rounded-xl',
                      isActive ? 'bg-indigo-500/20' : 'bg-muted'
                    )}>
                      <Icon className={cn(
                        'w-6 h-6',
                        isActive ? 'text-indigo-400' : 'text-muted-foreground'
                      )} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{tool.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                    </div>
                    {isSpeaking && isActive && (
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-4 bg-indigo-500 rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-6 bg-indigo-500 rounded animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-4 bg-indigo-500 rounded animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="mt-8 pt-6 border-t">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Rest</h4>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => speak("Take a deep breath. You're allowed to rest.")}
            >
              <Heart className="w-4 h-4 mr-1" />
              Permission to Rest
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => speak("In... and out. In... and out. Slower now. Good.")}
            >
              <Wind className="w-4 h-4 mr-1" />
              Slow Breath
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
