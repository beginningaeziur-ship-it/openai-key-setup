import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSAIDailyEngine, FOCUS_CATEGORIES, DailyTask } from '@/contexts/SAIDailyEngineContext';
import { useSAI } from '@/contexts/SAIContext';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { FullBodySAI } from '@/components/sai/FullBodySAI';
import { Sun, ChevronRight, Check, RefreshCw } from 'lucide-react';

interface MorningCheckInProps {
  onComplete: () => void;
}

type Phase = 'greeting' | 'emotional' | 'focus' | 'tasks' | 'confirm';

const EMOTIONAL_OPTIONS = [
  { value: 1, label: 'Really struggling', emoji: '😔' },
  { value: 2, label: 'Difficult', emoji: '😕' },
  { value: 3, label: 'Okay', emoji: '😐' },
  { value: 4, label: 'Pretty good', emoji: '🙂' },
  { value: 5, label: 'Great', emoji: '😊' },
];

export function MorningCheckIn({ onComplete }: MorningCheckInProps) {
  const { userProfile } = useSAI();
  const { speak, voiceEnabled, isSpeaking } = useVoiceSettings();
  const { 
    todaysFocus, 
    getCheckInGreeting, 
    getTaskEncouragement,
    completeMorningCheckIn 
  } = useSAIDailyEngine();

  const userName = userProfile?.nickname || 'Friend';
  const saiName = userProfile?.saiNickname || 'SAI';

  const [phase, setPhase] = useState<Phase>('greeting');
  const [emotionalTemp, setEmotionalTemp] = useState<number>(3);
  const [proposedTasks, setProposedTasks] = useState<DailyTask[]>([]);
  const [currentMessage, setCurrentMessage] = useState(getCheckInGreeting());

  const speakMessage = useCallback((message: string) => {
    setCurrentMessage(message);
    if (voiceEnabled) {
      speak(message);
    }
  }, [voiceEnabled, speak]);

  // Generate tasks based on emotional temp and focus
  const generateTasks = useCallback(() => {
    const focus = todaysFocus.category;
    
    // Adjust task difficulty based on emotional temp
    const personalCareTasks: Record<number, string[]> = {
      1: ['Drink a sip of water', 'Breathe for 30 seconds', 'Stay in bed if you need to'],
      2: ['Drink a glass of water', 'Stretch gently', 'Get dressed if you can'],
      3: ['Take any medications', 'Eat something small', 'Wash your face'],
      4: ['Do your morning routine', 'Eat a proper meal', 'Get some fresh air'],
      5: ['Complete morning routine', 'Exercise lightly', 'Prepare for the day'],
    };

    const socialTasks: Record<number, string[]> = {
      1: ['You don\'t have to talk to anyone', 'Text one emoji to someone safe', 'Just know someone cares'],
      2: ['Send a quick message', 'Reply to one message', 'Wave at someone'],
      3: ['Have a brief conversation', 'Check in with a friend', 'Say hi to a neighbor'],
      4: ['Call or text someone', 'Have a meaningful chat', 'Share something about your day'],
      5: ['Connect with multiple people', 'Make plans with someone', 'Express gratitude to someone'],
    };

    const goalTasks: Record<number, string[]> = {
      1: ['Just exist today', 'One tiny thing if possible', 'Rest is productive'],
      2: ['Do one small thing', 'Look at your list', 'Any progress counts'],
      3: ['Complete one task', 'Work on something for 10 min', 'Check one thing off'],
      4: ['Focus on priority task', 'Make progress on a goal', 'Complete multiple tasks'],
      5: ['Tackle important projects', 'Push toward goals', 'Be productive'],
    };

    const level = emotionalTemp;
    
    const tasks: DailyTask[] = [
      {
        id: crypto.randomUUID(),
        type: 'personal_care',
        title: personalCareTasks[level][Math.floor(Math.random() * personalCareTasks[level].length)],
        completed: false,
        skipped: false,
        alternatives: personalCareTasks[level],
        category: focus,
      },
      {
        id: crypto.randomUUID(),
        type: 'social',
        title: socialTasks[level][Math.floor(Math.random() * socialTasks[level].length)],
        completed: false,
        skipped: false,
        alternatives: socialTasks[level],
        category: focus,
      },
      {
        id: crypto.randomUUID(),
        type: 'goal_specific',
        title: goalTasks[level][Math.floor(Math.random() * goalTasks[level].length)],
        completed: false,
        skipped: false,
        alternatives: goalTasks[level],
        category: focus,
      },
    ];

    return tasks;
  }, [emotionalTemp, todaysFocus]);

  // Handle phase transitions
  const handleNext = useCallback(() => {
    switch (phase) {
      case 'greeting':
        speakMessage('How are you feeling right now?');
        setPhase('emotional');
        break;
      case 'emotional':
        speakMessage(`Today we'll focus on ${todaysFocus.label}. We don't push everything every day. We take turns.`);
        setPhase('focus');
        break;
      case 'focus':
        const tasks = generateTasks();
        setProposedTasks(tasks);
        speakMessage(`Here are three gentle tasks for today. ${getTaskEncouragement()}`);
        setPhase('tasks');
        break;
      case 'tasks':
        speakMessage("You've got this. I'm here with you.");
        setPhase('confirm');
        break;
      case 'confirm':
        completeMorningCheckIn(emotionalTemp, proposedTasks);
        onComplete();
        break;
    }
  }, [phase, speakMessage, todaysFocus, generateTasks, getTaskEncouragement, completeMorningCheckIn, emotionalTemp, proposedTasks, onComplete]);

  // Regenerate a specific task
  const regenerateTask = useCallback((taskId: string) => {
    setProposedTasks(prev => prev.map(task => {
      if (task.id === taskId && task.alternatives) {
        const otherOptions = task.alternatives.filter(a => a !== task.title);
        const newTitle = otherOptions[Math.floor(Math.random() * otherOptions.length)] || task.title;
        return { ...task, title: newTitle };
      }
      return task;
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-md w-full animate-in fade-in-50 slide-in-from-bottom-4">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <FullBodySAI size="md" state={isSpeaking ? 'speaking' : 'attentive'} />
          </div>
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Sun className="w-5 h-5 text-amber-500" />
            Morning Check-In
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* SAI Message */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-foreground">{currentMessage}</p>
          </div>

          {/* Phase-specific content */}
          {phase === 'greeting' && (
            <div className="text-center">
              <p className="text-muted-foreground mb-2">
                Good morning, {userName}. Let's start the day together.
              </p>
              <p className="text-xs text-muted-foreground/70 mb-4">
                We'll build your goals gradually. These goals are guides, not rules.
              </p>
              <Button onClick={handleNext} className="w-full">
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {phase === 'emotional' && (
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {EMOTIONAL_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setEmotionalTemp(option.value)}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-lg border transition-all",
                      emotionalTemp === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-2xl mb-1">{option.emoji}</span>
                    <span className="text-xs text-muted-foreground text-center leading-tight">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
              <Button onClick={handleNext} className="w-full">
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {phase === 'focus' && (
            <div className="space-y-4">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                <span className="text-3xl mb-2 block">{todaysFocus.icon}</span>
                <h3 className="font-semibold text-lg">{todaysFocus.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {todaysFocus.description}
                </p>
              </div>
              <Button onClick={handleNext} className="w-full">
                See Today's Tasks
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {phase === 'tasks' && (
            <div className="space-y-4">
              {proposedTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {task.type.replace('_', ' ')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => regenerateTask(task.id)}
                    className="h-8 w-8"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <p className="text-xs text-muted-foreground text-center">
                Tap the refresh icon to get a different task. Skipping is always okay.
              </p>
              <Button onClick={handleNext} className="w-full">
                Accept These Tasks
                <Check className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {phase === 'confirm' && (
            <div className="text-center space-y-4">
              <div className="text-4xl">🌟</div>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Remember: If this is too much, we'll adjust. 
                  I'm here with you all day.
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Nothing here decides who you are. One small step is enough.
                </p>
              </div>
              <Button onClick={handleNext} className="w-full">
                Start My Day
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
