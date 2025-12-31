import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useSAIDailyEngine } from '@/contexts/SAIDailyEngineContext';
import { useSAI } from '@/contexts/SAIContext';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { FullBodySAI } from '@/components/sai/FullBodySAI';
import { Moon, ChevronRight, Check, X, SkipForward } from 'lucide-react';

interface EveningCheckInProps {
  onComplete: () => void;
}

type Phase = 'greeting' | 'review' | 'blockers' | 'reflection' | 'close';

export function EveningCheckIn({ onComplete }: EveningCheckInProps) {
  const { userProfile } = useSAI();
  const { speak, voiceEnabled, isSpeaking } = useVoiceSettings();
  const { 
    todaysTasks, 
    getCheckInGreeting,
    getReflectionPrompt,
    completeEveningCheckIn 
  } = useSAIDailyEngine();

  const userName = userProfile?.nickname || 'Friend';

  const [phase, setPhase] = useState<Phase>('greeting');
  const [blockers, setBlockers] = useState('');
  const [reflection, setReflection] = useState('');
  const [currentMessage, setCurrentMessage] = useState(getCheckInGreeting());

  const completedTasks = todaysTasks.filter(t => t.completed);
  const skippedTasks = todaysTasks.filter(t => t.skipped);
  const incompleteTasks = todaysTasks.filter(t => !t.completed && !t.skipped);

  const speakMessage = useCallback((message: string) => {
    setCurrentMessage(message);
    if (voiceEnabled) {
      speak(message);
    }
  }, [voiceEnabled, speak]);

  const handleNext = useCallback(() => {
    switch (phase) {
      case 'greeting':
        if (completedTasks.length > 0) {
          speakMessage(`You completed ${completedTasks.length} task${completedTasks.length > 1 ? 's' : ''} today. That's real progress.`);
        } else if (skippedTasks.length > 0 || incompleteTasks.length > 0) {
          speakMessage("Not every day goes as planned. That's okay. Let's look at what happened.");
        } else {
          speakMessage("Let's reflect on your day together.");
        }
        setPhase('review');
        break;
      case 'review':
        if (incompleteTasks.length > 0 || skippedTasks.length > 0) {
          speakMessage(getReflectionPrompt());
          setPhase('blockers');
        } else {
          speakMessage("Any thoughts about today you want to capture?");
          setPhase('reflection');
        }
        break;
      case 'blockers':
        speakMessage("Is there anything else on your mind tonight?");
        setPhase('reflection');
        break;
      case 'reflection':
        speakMessage("Incomplete doesn't mean failure. You showed up today, and that matters. Rest well.");
        setPhase('close');
        break;
      case 'close':
        completeEveningCheckIn(reflection, blockers);
        onComplete();
        break;
    }
  }, [phase, speakMessage, completedTasks, skippedTasks, incompleteTasks, getReflectionPrompt, completeEveningCheckIn, reflection, blockers, onComplete]);

  const handleSkip = useCallback(() => {
    completeEveningCheckIn('Skipped reflection', '');
    onComplete();
  }, [completeEveningCheckIn, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-md w-full animate-in fade-in-50 slide-in-from-bottom-4">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24">
              <FullBodySAI size="lg" state={isSpeaking ? 'speaking' : 'attentive'} />
            </div>
          </div>
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Moon className="w-5 h-5 text-indigo-400" />
            Evening Reflection
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* SAI Message */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-foreground">{currentMessage}</p>
          </div>

          {/* Phase-specific content */}
          {phase === 'greeting' && (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Time to wind down, {userName}. Let's look at your day together.
              </p>
              <p className="text-xs text-muted-foreground/70">
                Incomplete doesn't mean failure. You showed up, and that matters.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSkip} className="flex-1">
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip Tonight
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {phase === 'review' && (
            <div className="space-y-4">
              {/* Completed tasks */}
              {completedTasks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-green-600 dark:text-green-400">
                    ✓ Completed
                  </h4>
                  {completedTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{task.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Skipped/incomplete */}
              {(skippedTasks.length > 0 || incompleteTasks.length > 0) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Not today — and that's okay
                  </h4>
                  {[...skippedTasks, ...incompleteTasks].map(task => (
                    <div key={task.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                      <X className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{task.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {todaysTasks.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No tasks were set for today.
                </p>
              )}

              <Button onClick={handleNext} className="w-full">
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {phase === 'blockers' && (
            <div className="space-y-4">
              <Textarea
                placeholder="What got in the way? (optional)"
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <p className="text-xs text-muted-foreground text-center">
                This helps me adjust tomorrow's plan. No judgment.
              </p>
              <Button onClick={handleNext} className="w-full">
                {blockers ? 'Continue' : 'Skip This'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {phase === 'reflection' && (
            <div className="space-y-4">
              <Textarea
                placeholder="Any thoughts, wins, or feelings to capture? (optional)"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <Button onClick={handleNext} className="w-full">
                {reflection ? 'Continue' : 'Skip This'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {phase === 'close' && (
            <div className="text-center space-y-4">
              <div className="text-4xl">🌙</div>
              <div className="space-y-2">
                <p className="font-medium">You made it through another day.</p>
                <p className="text-sm text-muted-foreground">
                  Rest well, {userName}. I'll be here tomorrow.
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Nothing is locked in. Tomorrow is a new start.
                </p>
              </div>
              <Button onClick={handleNext} className="w-full">
                Good Night
                <Moon className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
