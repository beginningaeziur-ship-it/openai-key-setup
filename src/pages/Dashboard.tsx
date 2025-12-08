import { useNavigate } from 'react-router-dom';
import { useSAI } from '@/contexts/SAIContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  MessageCircle, 
  Target, 
  TrendingUp, 
  Heart, 
  Shield, 
  AlertTriangle,
  Settings,
  RotateCcw
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { userProfile, progressMetrics, goals, habits, cyPersonality } = useSAI();

  const cyName = userProfile?.cyNickname || 'Cy';
  const userName = userProfile?.nickname || 'Friend';

  const getStatusColor = (value: number) => {
    if (value >= 70) return 'text-status-stable';
    if (value >= 40) return 'text-status-caution';
    if (value >= 20) return 'text-status-alert';
    return 'text-status-crisis';
  };

  const getProgressColor = (value: number) => {
    if (value >= 70) return 'bg-status-stable';
    if (value >= 40) return 'bg-status-caution';
    if (value >= 20) return 'bg-status-alert';
    return 'bg-status-crisis';
  };

  return (
    <div className="min-h-screen bg-gradient-calm">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg">SAI Ally Guide</h1>
              <p className="text-sm text-muted-foreground">Hey, {userName}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Chat CTA */}
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-display font-semibold">Talk to {cyName}</h2>
                <p className="text-muted-foreground">
                  I'm here whenever you need support.
                </p>
              </div>
              <Button 
                onClick={() => navigate('/chat')}
                className="h-12 px-6 rounded-xl"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Stability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <span className={`text-3xl font-display font-bold ${getStatusColor(progressMetrics.stability)}`}>
                  {progressMetrics.stability}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${getProgressColor(progressMetrics.stability)}`}
                  style={{ width: `${progressMetrics.stability}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Consistency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <span className={`text-3xl font-display font-bold ${getStatusColor(progressMetrics.consistency)}`}>
                  {progressMetrics.consistency}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${getProgressColor(progressMetrics.consistency)}`}
                  style={{ width: `${progressMetrics.consistency}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Emotional Regulation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <span className={`text-3xl font-display font-bold ${getStatusColor(progressMetrics.emotionalRegulation)}`}>
                  {progressMetrics.emotionalRegulation}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${getProgressColor(progressMetrics.emotionalRegulation)}`}
                  style={{ width: `${progressMetrics.emotionalRegulation}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Recovery Speed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <span className={`text-3xl font-display font-bold ${getStatusColor(progressMetrics.recoverySpeed)}`}>
                  {progressMetrics.recoverySpeed}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${getProgressColor(progressMetrics.recoverySpeed)}`}
                  style={{ width: `${progressMetrics.recoverySpeed}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Your Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No goals set yet.</p>
                <p className="text-sm mt-1">Chat with {cyName} to create your first goal.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.slice(0, 3).map(goal => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{goal.title}</span>
                      <span className="text-sm text-muted-foreground">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Support Button */}
        <Card className="bg-sai-rose/30 border-sai-rose-dark/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-sai-rose-dark" />
                <div>
                  <h3 className="font-medium">Need Extra Support?</h3>
                  <p className="text-sm text-muted-foreground">
                    Alert your supervisor discreetly
                  </p>
                </div>
              </div>
              <Button variant="outline" className="border-sai-rose-dark/30">
                Request Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
