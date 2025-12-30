import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSAIDailyEngine, DailyTask } from '@/contexts/SAIDailyEngineContext';
import { Check, X, ListTodo, Sparkles } from 'lucide-react';

interface DailyTaskListProps {
  compact?: boolean;
}

export function DailyTaskList({ compact = false }: DailyTaskListProps) {
  const { todaysTasks, todaysFocus, completeTask, skipTask } = useSAIDailyEngine();

  if (todaysTasks.length === 0) {
    return null;
  }

  const completedCount = todaysTasks.filter(t => t.completed).length;
  const allDone = completedCount === todaysTasks.length;

  if (compact) {
    return (
      <div className="bg-card/80 backdrop-blur-sm rounded-lg p-3 border border-border/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium flex items-center gap-2">
            <ListTodo className="w-4 h-4" />
            Today's Tasks
          </span>
          <span className="text-xs text-muted-foreground">
            {completedCount}/{todaysTasks.length}
          </span>
        </div>
        <div className="space-y-1">
          {todaysTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              compact
              onComplete={() => completeTask(task.id)}
              onSkip={() => skipTask(task.id)}
            />
          ))}
        </div>
        {allDone && (
          <div className="mt-2 text-center text-xs text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            All done for today!
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <span className="text-xl">{todaysFocus.icon}</span>
            {todaysFocus.label}
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {completedCount}/{todaysTasks.length} done
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {todaysTasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onComplete={() => completeTask(task.id)}
            onSkip={() => skipTask(task.id)}
          />
        ))}
        {allDone && (
          <div className="text-center py-3 text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">You did it! All tasks complete.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TaskRowProps {
  task: DailyTask;
  compact?: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

function TaskRow({ task, compact = false, onComplete, onSkip }: TaskRowProps) {
  const isFinished = task.completed || task.skipped;

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg transition-all",
        compact ? "bg-muted/30" : "bg-muted/50",
        task.completed && "bg-green-50 dark:bg-green-950/20",
        task.skipped && "opacity-50"
      )}
    >
      {/* Status indicator */}
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
        task.completed ? "bg-green-500 text-white" :
        task.skipped ? "bg-muted-foreground/30" :
        "bg-primary/20"
      )}>
        {task.completed ? (
          <Check className="w-3 h-3" />
        ) : task.skipped ? (
          <X className="w-3 h-3" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-primary" />
        )}
      </div>

      {/* Task content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium truncate",
          isFinished && "line-through text-muted-foreground"
        )}>
          {task.title}
        </p>
        {!compact && (
          <p className="text-xs text-muted-foreground capitalize">
            {task.type.replace('_', ' ')}
          </p>
        )}
      </div>

      {/* Actions */}
      {!isFinished && (
        <div className="flex gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onComplete}
            className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSkip}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
