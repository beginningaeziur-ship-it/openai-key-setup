// Dresser Panel - Daily Living Tasks
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { Shirt, Droplets, UtensilsCrossed, Pill, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DresserPanelProps {
  open: boolean;
  onClose: () => void;
  userName?: string;
}

const dailyTasks = [
  { id: 'brush-teeth', label: 'Brush teeth', icon: Sparkles, category: 'hygiene' },
  { id: 'wash-face', label: 'Wash face', icon: Droplets, category: 'hygiene' },
  { id: 'shower', label: 'Shower or wash up', icon: Droplets, category: 'hygiene' },
  { id: 'get-dressed', label: 'Get dressed', icon: Shirt, category: 'clothes' },
  { id: 'eat-something', label: 'Eat something', icon: UtensilsCrossed, category: 'food' },
  { id: 'drink-water', label: 'Drink water', icon: Droplets, category: 'hydration' },
  { id: 'take-meds', label: 'Take medications', icon: Pill, category: 'meds' },
];

export function DresserPanel({ open, onClose, userName = 'Friend' }: DresserPanelProps) {
  const { speak, voiceEnabled } = useVoiceSettings();
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
      if (voiceEnabled) {
        speak("Good. One small step at a time.");
      }
    }
    setCompletedTasks(newCompleted);
  };

  const completedCount = completedTasks.size;
  const totalCount = dailyTasks.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/20">
              <Shirt className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <SheetTitle>Daily Living Tasks</SheetTitle>
              <SheetDescription>
                Small self-care steps at your own pace
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Today's progress</span>
            <span className="font-medium">{completedCount} / {totalCount}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-3">
          {dailyTasks.map((task) => {
            const Icon = task.icon;
            const isCompleted = completedTasks.has(task.id);
            
            return (
              <Card 
                key={task.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md border',
                  isCompleted ? 'border-amber-500/50 bg-amber-50/30 dark:bg-amber-950/10' : 'border-border/50'
                )}
                onClick={() => toggleTask(task.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Checkbox 
                      checked={isCompleted}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                    />
                    <div className={cn(
                      'p-2 rounded-lg',
                      isCompleted ? 'bg-amber-500/20' : 'bg-muted'
                    )}>
                      <Icon className={cn(
                        'w-4 h-4',
                        isCompleted ? 'text-amber-500' : 'text-muted-foreground'
                      )} />
                    </div>
                    <span className={cn(
                      'font-medium',
                      isCompleted && 'line-through text-muted-foreground'
                    )}>
                      {task.label}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Encouragement */}
        <div className="mt-8 pt-6 border-t">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => speak("Every small thing you do matters. You're taking care of yourself, and that takes strength.")}
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Encouragement
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
