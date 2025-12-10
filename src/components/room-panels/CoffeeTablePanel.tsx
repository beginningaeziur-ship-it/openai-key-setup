// Coffee Table Panel - Daily Tasks, Reminders, Tools
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useSelfStart, type RoutineType } from '@/contexts/SelfStartContext';
import { useSAI } from '@/contexts/SAIContext';
import { 
  Coffee, 
  ListTodo, 
  Plus, 
  Bell, 
  Target,
  CheckCircle2,
  Circle,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoffeeTablePanelProps {
  open: boolean;
  onClose: () => void;
}

interface QuickTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export function CoffeeTablePanel({ open, onClose }: CoffeeTablePanelProps) {
  const { routines, toggleRoutine, globalEnabled } = useSelfStart();
  const { goals, habits, updateGoal } = useSAI();
  
  const [tasks, setTasks] = useState<QuickTask[]>(() => {
    try {
      const saved = localStorage.getItem('sai_quick_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newTask, setNewTask] = useState('');

  const saveTasks = (updated: QuickTask[]) => {
    setTasks(updated);
    localStorage.setItem('sai_quick_tasks', JSON.stringify(updated));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const task: QuickTask = {
      id: crypto.randomUUID(),
      text: newTask.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    saveTasks([...tasks, task]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    saveTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  const activeReminders = routines.filter(r => r.enabled);
  const todaysTasks = tasks.filter(t => {
    const created = new Date(t.createdAt);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  });

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-teal-500/20">
              <Coffee className="w-6 h-6 text-teal-500" />
            </div>
            <div>
              <SheetTitle>Daily Tools</SheetTitle>
              <SheetDescription>
                Tasks, reminders, and today's focus
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-8">
          {/* Quick Tasks */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <ListTodo className="w-4 h-4" />
              Today's Tasks
            </h3>
            
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Add a task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
              />
              <Button onClick={addTask} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {todaysTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tasks for today. Add one above!
                </p>
              ) : (
                todaysTasks.map((task) => (
                  <div 
                    key={task.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg bg-muted/50',
                      task.completed && 'opacity-60'
                    )}
                  >
                    <button onClick={() => toggleTask(task.id)}>
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                    <span className={cn(
                      'flex-1 text-sm',
                      task.completed && 'line-through text-muted-foreground'
                    )}>
                      {task.text}
                    </span>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Reminders */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Active Reminders
              {!globalEnabled && (
                <span className="text-xs text-muted-foreground">(paused)</span>
              )}
            </h3>
            
            {activeReminders.length === 0 ? (
              <Card>
                <CardContent className="p-4 text-center text-sm text-muted-foreground">
                  No active reminders. Enable some in Settings.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {activeReminders.slice(0, 5).map((reminder) => (
                  <div 
                    key={reminder.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <span className="text-sm capitalize">
                      {reminder.type.replace(/-/g, ' ')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {reminder.time || `Every ${reminder.intervalMinutes}m`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goals Progress */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Goal Progress
            </h3>
            
            {goals.length === 0 ? (
              <Card>
                <CardContent className="p-4 text-center text-sm text-muted-foreground">
                  No goals set yet. Talk to SAI about what you'd like to work on.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {goals.slice(0, 3).map((goal) => (
                  <Card key={goal.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{goal.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {goal.progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
