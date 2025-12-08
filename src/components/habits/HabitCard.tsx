import { useState } from 'react';
import { Habit, getReminderFrequency } from '@/types/sai';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Check, 
  Bell, 
  BellOff, 
  Flame, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HabitCardProps {
  habit: Habit;
  onComplete: (id: string) => void;
  onToggleReminder: (id: string) => void;
}

export function HabitCard({ habit, onComplete, onToggleReminder }: HabitCardProps) {
  const [justCompleted, setJustCompleted] = useState(false);
  
  const progress = Math.round((habit.repetitions / habit.targetRepetitions) * 100);
  const isHabitFormed = habit.repetitions >= habit.targetRepetitions;
  const currentReminderLevel = getReminderFrequency(habit.repetitions, habit.targetRepetitions);
  
  const isCompletedToday = habit.lastCompleted && 
    new Date(habit.lastCompleted).toDateString() === new Date().toDateString();

  const handleComplete = () => {
    if (isCompletedToday) return;
    setJustCompleted(true);
    onComplete(habit.id);
    setTimeout(() => setJustCompleted(false), 1500);
  };

  const getReminderLabel = () => {
    switch (currentReminderLevel) {
      case 'high': return 'Daily reminders';
      case 'medium': return 'Regular reminders';
      case 'low': return 'Occasional reminders';
      case 'minimal': return 'Rare reminders';
      case 'off': return 'No reminders needed';
    }
  };

  const getReminderColor = () => {
    switch (currentReminderLevel) {
      case 'high': return 'text-primary';
      case 'medium': return 'text-primary/80';
      case 'low': return 'text-primary/60';
      case 'minimal': return 'text-muted-foreground';
      case 'off': return 'text-progress-stable';
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-300",
      justCompleted && "ring-2 ring-progress-stable",
      isHabitFormed && "bg-progress-stable/10 border-progress-stable/30"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{habit.title}</h3>
              {isHabitFormed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-progress-stable/20 text-progress-stable text-xs">
                  <Sparkles className="w-3 h-3" />
                  Formed
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {habit.repetitions} / {habit.targetRepetitions} reps
                </span>
                <span className={cn(
                  "font-medium",
                  progress >= 70 ? "text-progress-stable" :
                  progress >= 40 ? "text-progress-building" :
                  "text-primary"
                )}>
                  {progress}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="flex items-center gap-4 text-sm">
              {habit.streak > 0 && (
                <span className="inline-flex items-center gap-1 text-progress-attention">
                  <Flame className="w-4 h-4" />
                  {habit.streak} day streak
                </span>
              )}
              <span className={cn("inline-flex items-center gap-1", getReminderColor())}>
                {currentReminderLevel === 'off' ? (
                  <BellOff className="w-3.5 h-3.5" />
                ) : (
                  <Bell className="w-3.5 h-3.5" />
                )}
                {getReminderLabel()}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              size="icon"
              variant={isCompletedToday ? "secondary" : "default"}
              className={cn(
                "h-12 w-12 rounded-xl transition-all",
                isCompletedToday && "bg-progress-stable text-primary-foreground"
              )}
              onClick={handleComplete}
              disabled={isCompletedToday}
            >
              {isCompletedToday ? (
                <Check className="w-5 h-5" />
              ) : (
                <RotateCcw className="w-5 h-5" />
              )}
            </Button>
            {habit.reminderEnabled && currentReminderLevel !== 'off' && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => onToggleReminder(habit.id)}
              >
                <BellOff className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}