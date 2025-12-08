import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Map, 
  Target,
  Milestone,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Goal } from '@/types/sai';

interface RoadmapCardProps {
  goals: Goal[];
}

export function RoadmapCard({ goals }: RoadmapCardProps) {
  const longTermGoals = goals.filter(g => g.type === 'long_term');
  const midpointGoals = goals.filter(g => g.type === 'midpoint');
  const microGoals = goals.filter(g => g.type === 'micro');

  const getGoalTypeIcon = (type: Goal['type']) => {
    switch (type) {
      case 'long_term': return <Target className="w-4 h-4" />;
      case 'midpoint': return <Milestone className="w-4 h-4" />;
      case 'micro': return <Sparkles className="w-4 h-4" />;
    }
  };

  const getGoalTypeLabel = (type: Goal['type']) => {
    switch (type) {
      case 'long_term': return '3-6 months';
      case 'midpoint': return '6-8 weeks';
      case 'micro': return 'Daily';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-progress-stable';
    if (progress >= 50) return 'bg-progress-building';
    if (progress >= 30) return 'bg-progress-attention';
    return 'bg-progress-support';
  };

  if (goals.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <Map className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">No roadmap yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Chat to build your personalized 3-6 month plan.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Map className="w-5 h-5 text-primary" />
          Your Roadmap
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Long-term Goals (3-6 months) */}
        {longTermGoals.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Target className="w-4 h-4" />
              Major Goals (3-6 months)
            </div>
            {longTermGoals.map(goal => (
              <GoalItem key={goal.id} goal={goal} />
            ))}
          </div>
        )}

        {/* Mid-point Goals (6-8 weeks) */}
        {midpointGoals.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Milestone className="w-4 h-4" />
              Mid Goals (6-8 weeks)
            </div>
            {midpointGoals.map(goal => (
              <GoalItem key={goal.id} goal={goal} />
            ))}
          </div>
        )}

        {/* Micro Goals */}
        {microGoals.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              Micro Steps
            </div>
            {microGoals.slice(0, 3).map(goal => (
              <GoalItem key={goal.id} goal={goal} compact />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function GoalItem({ goal, compact = false }: { goal: Goal; compact?: boolean }) {
  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-progress-stable';
    if (progress >= 50) return 'bg-progress-building';
    if (progress >= 30) return 'bg-progress-attention';
    return 'bg-muted-foreground/30';
  };

  return (
    <div className={cn(
      "p-3 rounded-lg bg-muted/50",
      compact && "p-2"
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className={cn("font-medium", compact && "text-sm")}>
          {goal.title}
        </span>
        <Badge variant="outline" className="text-xs">
          {goal.progress}%
        </Badge>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all", getProgressColor(goal.progress))}
          style={{ width: `${goal.progress}%` }}
        />
      </div>
      {goal.targetDate && !compact && (
        <p className="text-xs text-muted-foreground mt-2">
          Target: {new Date(goal.targetDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}