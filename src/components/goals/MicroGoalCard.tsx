import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  RefreshCw,
  ChevronRight,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MicroGoal {
  id: string;
  title: string;
  completed: boolean;
  category: string;
}

interface MicroGoalCardProps {
  userName: string;
  saiName: string;
}

export function MicroGoalCard({ userName, saiName }: MicroGoalCardProps) {
  const [microGoals, setMicroGoals] = useState<MicroGoal[]>([
    { id: '1', title: 'Take 3 slow breaths', completed: false, category: 'grounding' },
    { id: '2', title: 'Drink a glass of water', completed: false, category: 'physical' },
    { id: '3', title: 'Name 5 things you can see', completed: false, category: 'grounding' },
  ]);
  const [refreshing, setRefreshing] = useState(false);

  const completedCount = microGoals.filter(g => g.completed).length;
  const allCompleted = completedCount === microGoals.length;

  const handleToggle = (id: string) => {
    setMicroGoals(prev => prev.map(g => 
      g.id === id ? { ...g, completed: !g.completed } : g
    ));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate getting new micro-goals
    setTimeout(() => {
      setMicroGoals([
        { id: '4', title: 'Step outside for 2 minutes', completed: false, category: 'physical' },
        { id: '5', title: 'Send one text to someone', completed: false, category: 'connection' },
        { id: '6', title: 'Write down one feeling', completed: false, category: 'emotional' },
      ]);
      setRefreshing(false);
    }, 500);
  };

  return (
    <Card className="sai-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Today's Micro-Goals
          </span>
          <Badge variant="outline" className="text-xs">
            {completedCount}/{microGoals.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Small steps, {userName}. No pressure.
        </p>

        <div className="space-y-2">
          {microGoals.map(goal => (
            <div 
              key={goal.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all",
                goal.completed 
                  ? "bg-progress-stable/10 line-through text-muted-foreground" 
                  : "bg-muted/50 hover:bg-muted"
              )}
            >
              <Checkbox
                checked={goal.completed}
                onCheckedChange={() => handleToggle(goal.id)}
                className="data-[state=checked]:bg-progress-stable data-[state=checked]:border-progress-stable"
              />
              <span className="text-sm flex-1">{goal.title}</span>
              <Badge variant="secondary" className="text-xs capitalize">
                {goal.category}
              </Badge>
            </div>
          ))}
        </div>

        {allCompleted ? (
          <div className="text-center py-4 space-y-3">
            <div className="flex items-center justify-center gap-2 text-progress-stable">
              <Check className="w-5 h-5" />
              <span className="font-medium">Nice work, {userName}!</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
              Get New Goals
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center">
            Complete what feels doable. Skip what doesn't.
          </p>
        )}
      </CardContent>
    </Card>
  );
}