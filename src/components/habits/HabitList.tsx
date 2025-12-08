import { useState } from 'react';
import { useSAI } from '@/contexts/SAIContext';
import { HabitCard } from './HabitCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Repeat, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const HABIT_CATEGORIES = [
  { value: 'health', label: 'Health & Body' },
  { value: 'emotional', label: 'Emotional Care' },
  { value: 'routine', label: 'Daily Routine' },
  { value: 'social', label: 'Social Connection' },
  { value: 'recovery', label: 'Recovery & Healing' },
  { value: 'skills', label: 'Skills & Growth' },
];

export function HabitList() {
  const { habits, addHabit, updateHabit, userProfile } = useSAI();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('health');
  const [targetReps, setTargetReps] = useState([45]); // Default 45 reps

  const saiName = userProfile?.saiNickname || 'SAI';

  const handleAddHabit = () => {
    if (!newHabitTitle.trim()) return;

    addHabit({
      title: newHabitTitle.trim(),
      category: newHabitCategory,
      repetitions: 0,
      targetRepetitions: targetReps[0],
      streak: 0,
      reminderFrequency: 'high',
      reminderEnabled: true,
      createdAt: new Date().toISOString(),
    });

    setNewHabitTitle('');
    setNewHabitCategory('health');
    setTargetReps([45]);
    setShowAddDialog(false);

    toast({
      description: "Habit added. Small steps lead to big changes.",
    });
  };

  const handleCompleteHabit = (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const wasCompletedYesterday = habit.lastCompleted && 
      new Date(habit.lastCompleted).toDateString() === 
      new Date(Date.now() - 86400000).toDateString();

    const newStreak = wasCompletedYesterday ? habit.streak + 1 : 1;
    const newReps = habit.repetitions + 1;
    const isNowFormed = newReps >= habit.targetRepetitions && habit.repetitions < habit.targetRepetitions;

    updateHabit(id, {
      repetitions: newReps,
      streak: newStreak,
      lastCompleted: new Date().toISOString(),
    });

    if (isNowFormed) {
      toast({
        title: "🎉 Habit Formed!",
        description: `"${habit.title}" is now part of who you are. Amazing work.`,
      });
    } else if (newStreak % 7 === 0) {
      toast({
        description: `${newStreak} day streak! You're building something real.`,
      });
    }
  };

  const handleToggleReminder = (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    updateHabit(id, {
      reminderEnabled: !habit.reminderEnabled,
    });

    toast({
      description: habit.reminderEnabled 
        ? "Reminders paused for this habit." 
        : "Reminders re-enabled.",
    });
  };

  const activeHabits = habits.filter(h => h.repetitions < h.targetRepetitions);
  const formedHabits = habits.filter(h => h.repetitions >= h.targetRepetitions);

  return (
    <Card className="sai-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-primary" />
            Habit Builder
          </span>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="w-4 h-4" />
                New Habit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start a New Habit</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="habit-title">What habit do you want to build?</Label>
                  <Input
                    id="habit-title"
                    value={newHabitTitle}
                    onChange={(e) => setNewHabitTitle(e.target.value)}
                    placeholder="e.g., Take a short walk"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newHabitCategory} onValueChange={setNewHabitCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HABIT_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Repetitions to form habit</Label>
                    <span className="text-sm font-medium text-primary">{targetReps[0]} days</span>
                  </div>
                  <Slider
                    value={targetReps}
                    onValueChange={setTargetReps}
                    min={30}
                    max={60}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    Research shows habits form between 30-60 repetitions. {saiName} will remind you less as the habit solidifies.
                  </p>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleAddHabit} disabled={!newHabitTitle.trim()}>
                    Start Habit
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {habits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Repeat className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No habits yet.</p>
            <p className="text-sm mt-1">
              Start small. One tiny habit can change everything.
            </p>
          </div>
        ) : (
          <>
            {activeHabits.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Building</h4>
                {activeHabits.map(habit => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onComplete={handleCompleteHabit}
                    onToggleReminder={handleToggleReminder}
                  />
                ))}
              </div>
            )}

            {formedHabits.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Formed ({formedHabits.length})
                </h4>
                {formedHabits.map(habit => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onComplete={handleCompleteHabit}
                    onToggleReminder={handleToggleReminder}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}