import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSAI } from '@/contexts/SAIContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { HabitList } from '@/components/habits/HabitList';
import { 
  MessageCircle, 
  Target, 
  TrendingUp, 
  Heart, 
  Shield, 
  AlertTriangle,
  Settings,
  RotateCcw,
  Eye,
  Plus,
  Calendar,
  Zap,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile, progressMetrics, goals, habits, addGoal, cyPersonality } = useSAI();
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [alertSending, setAlertSending] = useState(false);

  const cyName = userProfile?.cyNickname || 'Cy';
  const userName = userProfile?.nickname || 'Friend';

  const getStatusColor = (value: number) => {
    if (value >= 70) return 'text-progress-stable';
    if (value >= 50) return 'text-progress-building';
    if (value >= 30) return 'text-progress-attention';
    return 'text-progress-support';
  };

  const getProgressColor = (value: number) => {
    if (value >= 70) return 'bg-progress-stable';
    if (value >= 50) return 'bg-progress-building';
    if (value >= 30) return 'bg-progress-attention';
    return 'bg-progress-support';
  };

  const handleAddGoal = () => {
    if (!newGoalTitle.trim()) return;
    
    addGoal({
      title: newGoalTitle.trim(),
      category: 'personal',
      type: 'long_term',
      progress: 0,
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months
    });
    
    setNewGoalTitle('');
    setNewGoalDescription('');
    setShowGoalDialog(false);
    
    toast({
      description: "Goal added. You've got this.",
    });
  };

  const handleSupervisorAlert = async () => {
    setAlertSending(true);
    
    // Simulate sending alert (in production, this would go to a real endpoint)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setAlertSending(false);
    setShowSupportDialog(false);
    
    toast({
      title: "Support request sent",
      description: "Your supervisor has been notified. They'll check in soon.",
    });
  };

  const overallProgress = Math.round(
    (progressMetrics.stability + progressMetrics.consistency + 
     progressMetrics.emotionalRegulation + progressMetrics.recoverySpeed) / 4
  );

  return (
    <div className="min-h-screen sai-gradient-night">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center sai-breathe">
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
        <Card className="bg-primary/10 border-primary/20 sai-fade-in">
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

        {/* Overall Status */}
        <Card className="sai-slide-up">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Overall Stability
              </span>
              <span className={cn("text-2xl font-display", getStatusColor(overallProgress))}>
                {overallProgress}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-500", getProgressColor(overallProgress))}
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Based on stability, consistency, emotional regulation, and recovery speed.
            </p>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="sai-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Stability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <span className={cn("text-3xl font-display font-bold", getStatusColor(progressMetrics.stability))}>
                  {progressMetrics.stability}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all", getProgressColor(progressMetrics.stability))}
                  style={{ width: `${progressMetrics.stability}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="sai-fade-in" style={{ animationDelay: '0.15s' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Consistency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <span className={cn("text-3xl font-display font-bold", getStatusColor(progressMetrics.consistency))}>
                  {progressMetrics.consistency}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all", getProgressColor(progressMetrics.consistency))}
                  style={{ width: `${progressMetrics.consistency}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="sai-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Emotional Regulation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <span className={cn("text-3xl font-display font-bold", getStatusColor(progressMetrics.emotionalRegulation))}>
                  {progressMetrics.emotionalRegulation}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all", getProgressColor(progressMetrics.emotionalRegulation))}
                  style={{ width: `${progressMetrics.emotionalRegulation}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="sai-fade-in" style={{ animationDelay: '0.25s' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Recovery Speed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <span className={cn("text-3xl font-display font-bold", getStatusColor(progressMetrics.recoverySpeed))}>
                  {progressMetrics.recoverySpeed}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all", getProgressColor(progressMetrics.recoverySpeed))}
                  style={{ width: `${progressMetrics.recoverySpeed}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals Section */}
        <Card className="sai-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Your Goals
              </span>
              <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Plus className="w-4 h-4" />
                    Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add a New Goal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal-title">What would you like to work towards?</Label>
                      <Input
                        id="goal-title"
                        value={newGoalTitle}
                        onChange={(e) => setNewGoalTitle(e.target.value)}
                        placeholder="e.g., Find stable housing"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal-desc">Why is this important to you? (optional)</Label>
                      <Textarea
                        id="goal-desc"
                        value={newGoalDescription}
                        onChange={(e) => setNewGoalDescription(e.target.value)}
                        placeholder="This helps Cy understand your journey..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={handleAddGoal} disabled={!newGoalTitle.trim()}>
                        Add Goal
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No goals set yet.</p>
                <p className="text-sm mt-1">Add a goal or chat with {cyName} to create your roadmap.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.slice(0, 5).map(goal => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{goal.title}</span>
                      <span className={cn("text-sm font-semibold", getStatusColor(goal.progress))}>
                        {goal.progress}%
                      </span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                ))}
              </div>
          )}
          </CardContent>
        </Card>

        {/* Habit Tracking */}
        <HabitList />

        {/* Watcher View Link */}
        <Card className="border-primary/20 sai-fade-in" style={{ animationDelay: '0.35s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-medium">Professional View</h3>
                  <p className="text-sm text-muted-foreground">
                    Anonymized overview for your care team
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/watcher')}>
                Open Watcher
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support Button */}
        <Card className="bg-destructive/10 border-destructive/20 sai-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                <div>
                  <h3 className="font-medium">Need Extra Support?</h3>
                  <p className="text-sm text-muted-foreground">
                    Alert your supervisor discreetly
                  </p>
                </div>
              </div>
              <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                    <Bell className="w-4 h-4 mr-2" />
                    Request Support
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Support</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <p className="text-muted-foreground">
                      This will send an anonymous alert to your supervisor. They will only see:
                    </p>
                    <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                      <li>• Your client code (not your name)</li>
                      <li>• General category of need</li>
                      <li>• Current stability trend</li>
                    </ul>
                    <p className="text-sm font-medium">
                      No personal details, trauma info, or conversations will be shared.
                    </p>
                    <div className="flex gap-3 justify-end pt-2">
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button 
                        onClick={handleSupervisorAlert}
                        disabled={alertSending}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {alertSending ? "Sending..." : "Send Alert"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
