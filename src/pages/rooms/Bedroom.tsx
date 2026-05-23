import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { SAICharacter } from '@/components/aezuir/SAICharacter';
import { PanicButton } from '@/components/aezuir/PanicButton';
import { useSAI } from '@/contexts/SAIContext';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useSAIDailyEngine } from '@/contexts/SAIDailyEngineContext';
import {
  ChevronLeft,
  Moon,
  Sun,
  Sunset,
  CheckCircle2,
  Circle,
  Target,
  Star,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import cozyBedroomBg from '@/assets/cozy-bedroom-bg.jpg';

/**
 * Bedroom — Daily check-ins and goal tracking.
 *
 * Three check-in times:
 *  - Morning (5am–11am): Set intentions, review goals, energy check
 *  - Mid-afternoon (12pm–4pm): Progress pulse, adjust if needed
 *  - Evening (5pm–11pm): Reflection, wins, tomorrow's intention
 *
 * Goal structure: 1 long-term, 4 medium, 8 small goals
 */

// ─── Types ───────────────────────────────────────────────────────────────────

interface CheckInQuestion {
  id: string;
  text: string;
  type: 'scale' | 'boolean' | 'open';
}

interface CheckInSession {
  period: 'morning' | 'afternoon' | 'evening';
  label: string;
  Icon: React.ElementType;
  color: string;
  greeting: string;
  questions: CheckInQuestion[];
}

interface GoalItem {
  id: string;
  text: string;
  tier: 'long' | 'medium' | 'small';
  done: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CHECK_IN_SESSIONS: CheckInSession[] = [
  {
    period: 'morning',
    label: 'Morning Check-In',
    Icon: Sun,
    color: 'text-amber-400',
    greeting: "Good morning. Take a breath — let's start gently.",
    questions: [
      { id: 'm1', text: 'How did you sleep? (1 = rough, 5 = restful)', type: 'scale' },
      { id: 'm2', text: 'How is your body feeling right now?', type: 'scale' },
      { id: 'm3', text: 'Did you take your medication if you have one?', type: 'boolean' },
      { id: 'm4', text: 'What is one thing you want to focus on today?', type: 'open' },
      { id: 'm5', text: 'Do you feel safe right now?', type: 'boolean' },
    ],
  },
  {
    period: 'afternoon',
    label: 'Afternoon Check-In',
    Icon: Sunset,
    color: 'text-orange-400',
    greeting: "How are you doing? Checking in, no pressure.",
    questions: [
      { id: 'a1', text: 'How is your energy right now? (1 = low, 5 = good)', type: 'scale' },
      { id: 'a2', text: 'Have you eaten or had water today?', type: 'boolean' },
      { id: 'a3', text: 'Is anything feeling hard right now?', type: 'boolean' },
      { id: 'a4', text: 'What small win have you had today?', type: 'open' },
    ],
  },
  {
    period: 'evening',
    label: 'Evening Reflection',
    Icon: Moon,
    color: 'text-indigo-400',
    greeting: "The day is winding down. You made it here — that matters.",
    questions: [
      { id: 'e1', text: 'How are you feeling right now? (1 = struggling, 5 = okay)', type: 'scale' },
      { id: 'e2', text: 'Did you accomplish something today, even something small?', type: 'boolean' },
      { id: 'e3', text: 'Is there anything you need before sleep?', type: 'open' },
      { id: 'e4', text: 'What is one thing you are grateful for today?', type: 'open' },
      { id: 'e5', text: 'Do you feel safe right now?', type: 'boolean' },
    ],
  },
];

const DEFAULT_GOALS: GoalItem[] = [
  { id: 'lt1', text: 'Build long-term stability and independence', tier: 'long', done: false },
  { id: 'mt1', text: 'Establish a consistent daily routine', tier: 'medium', done: false },
  { id: 'mt2', text: 'Connect with one supportive person this week', tier: 'medium', done: false },
  { id: 'mt3', text: 'Practice one grounding exercise daily', tier: 'medium', done: false },
  { id: 'mt4', text: 'Take care of a basic need each day', tier: 'medium', done: false },
  { id: 'st1', text: 'Drink water this morning', tier: 'small', done: false },
  { id: 'st2', text: 'Open the app and check in', tier: 'small', done: false },
  { id: 'st3', text: 'Take three deep breaths', tier: 'small', done: false },
  { id: 'st4', text: 'Step outside or open a window', tier: 'small', done: false },
  { id: 'st5', text: 'Eat something today', tier: 'small', done: false },
  { id: 'st6', text: 'Rest for 10 minutes intentionally', tier: 'small', done: false },
  { id: 'st7', text: 'Write down one thought in the journal', tier: 'small', done: false },
  { id: 'st8', text: 'Do the evening check-in', tier: 'small', done: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentPeriod(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function loadGoals(): GoalItem[] {
  const saved = localStorage.getItem('aezuir_goals');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Reset small-goal "done" daily
      const today = new Date().toDateString();
      const lastReset = localStorage.getItem('aezuir_goals_date');
      if (lastReset !== today) {
        const reset = parsed.map((g: GoalItem) =>
          g.tier === 'small' ? { ...g, done: false } : g
        );
        localStorage.setItem('aezuir_goals', JSON.stringify(reset));
        localStorage.setItem('aezuir_goals_date', today);
        return reset;
      }
      return parsed;
    } catch {
      return DEFAULT_GOALS;
    }
  }
  return DEFAULT_GOALS;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Bedroom() {
  const navigate = useNavigate();
  const { userProfile } = useSAI();
  const { speak, voiceEnabled, isSpeaking } = useVoiceSettings();
  const { needsMorningCheckIn, needsEveningCheckIn } = useSAIDailyEngine();

  const userName = userProfile?.nickname || 'Friend';

  const [currentPeriod] = useState(getCurrentPeriod);
  const [activeSession, setActiveSession] = useState<CheckInSession | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number | boolean>>({});
  const [openAnswer, setOpenAnswer] = useState('');
  const [scaleValue, setScaleValue] = useState(3);
  const [sessionDone, setSessionDone] = useState(false);
  const [goals, setGoals] = useState<GoalItem[]>(loadGoals);
  const [saiMessage, setSaiMessage] = useState('');

  const hasGreeted = useRef(false);

  const say = useCallback(
    (msg: string) => {
      setSaiMessage(msg);
      if (voiceEnabled) speak(msg);
    },
    [voiceEnabled, speak]
  );

  // Greeting on mount
  useEffect(() => {
    if (hasGreeted.current) return;
    hasGreeted.current = true;
    const session = CHECK_IN_SESSIONS.find((s) => s.period === currentPeriod);
    const msg = session
      ? session.greeting
      : `Welcome to your bedroom, ${userName}. This is your safe home space.`;
    say(msg);
  }, [currentPeriod, say, userName]);

  // Save goals whenever they change
  useEffect(() => {
    localStorage.setItem('aezuir_goals', JSON.stringify(goals));
  }, [goals]);

  const startSession = useCallback(
    (session: CheckInSession) => {
      setActiveSession(session);
      setQuestionIndex(0);
      setAnswers({});
      setOpenAnswer('');
      setScaleValue(3);
      setSessionDone(false);
      say(session.greeting);
    },
    [say]
  );

  const answerQuestion = useCallback(() => {
    if (!activeSession) return;
    const q = activeSession.questions[questionIndex];
    let ans: string | number | boolean;
    if (q.type === 'scale') ans = scaleValue;
    else if (q.type === 'boolean') ans = true; // handled by explicit buttons
    else ans = openAnswer;

    setAnswers((prev) => ({ ...prev, [q.id]: ans }));

    if (questionIndex < activeSession.questions.length - 1) {
      const next = activeSession.questions[questionIndex + 1];
      setQuestionIndex((i) => i + 1);
      setOpenAnswer('');
      setScaleValue(3);
      say(next.text);
    } else {
      setSessionDone(true);
      say("Thank you for checking in. I heard you. You're doing what you can.");
    }
  }, [activeSession, questionIndex, scaleValue, openAnswer, say]);

  const answerBoolean = useCallback(
    (val: boolean) => {
      if (!activeSession) return;
      const q = activeSession.questions[questionIndex];
      setAnswers((prev) => ({ ...prev, [q.id]: val }));

      if (questionIndex < activeSession.questions.length - 1) {
        const next = activeSession.questions[questionIndex + 1];
        setQuestionIndex((i) => i + 1);
        setOpenAnswer('');
        setScaleValue(3);
        say(next.text);
      } else {
        setSessionDone(true);
        say("Thank you for checking in. I heard you. You're doing what you can.");
      }
    },
    [activeSession, questionIndex, say]
  );

  const toggleGoal = useCallback((id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g))
    );
  }, []);

  const smallDone = goals.filter((g) => g.tier === 'small' && g.done).length;
  const smallTotal = goals.filter((g) => g.tier === 'small').length;
  const mediumDone = goals.filter((g) => g.tier === 'medium' && g.done).length;
  const mediumTotal = goals.filter((g) => g.tier === 'medium').length;

  const saiState = isSpeaking
    ? 'speaking'
    : activeSession
    ? 'listening'
    : 'attentive';

  const currentSession = CHECK_IN_SESSIONS.find((s) => s.period === currentPeriod);
  const currentQ = activeSession?.questions[questionIndex];

  return (
    <div
      className="min-h-screen relative flex flex-col"
      style={{
        backgroundImage: `url(${cozyBedroomBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" aria-hidden="true" />

      {/* Header */}
      <header className="relative z-20 bg-black/40 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/aezuir')}
              className="text-white/70 hover:text-white"
              aria-label="Go back to home"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </Button>
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-300" aria-hidden="true" />
              <span className="font-semibold text-white">Bedroom</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col p-4 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full flex flex-col gap-4">

          {/* SAI */}
          <div className="flex justify-center">
            <SAICharacter state={saiState} size="md" showBreathing />
          </div>

          {/* SAI message bubble */}
          {saiMessage && (
            <div
              role="status"
              aria-live="polite"
              className="bg-black/60 backdrop-blur-sm rounded-xl p-4 border border-white/10"
            >
              <p className="text-white text-sm leading-relaxed text-center">{saiMessage}</p>
            </div>
          )}

          {/* ── Active check-in session ── */}
          {activeSession && !sessionDone && currentQ && (
            <Card className="bg-black/70 backdrop-blur-sm border-white/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    {React.createElement(activeSession.Icon, {
                      className: cn('w-4 h-4', activeSession.color),
                      'aria-hidden': true,
                    })}
                    {activeSession.label}
                  </CardTitle>
                  <span className="text-white/50 text-xs">
                    {questionIndex + 1} / {activeSession.questions.length}
                  </span>
                </div>
                <Progress
                  value={((questionIndex + 1) / activeSession.questions.length) * 100}
                  className="h-1 mt-2"
                  aria-label={`Check-in progress: question ${questionIndex + 1} of ${activeSession.questions.length}`}
                />
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white font-medium leading-relaxed">{currentQ.text}</p>

                {currentQ.type === 'scale' && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-white/60 text-xs px-1">
                      <span>1 — low</span>
                      <span>5 — high</span>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <Button
                          key={v}
                          variant={scaleValue === v ? 'default' : 'outline'}
                          size="lg"
                          className={cn(
                            'flex-1 h-12 text-lg font-bold border-white/20',
                            scaleValue === v ? 'bg-primary text-white' : 'text-white bg-white/10'
                          )}
                          onClick={() => setScaleValue(v)}
                          aria-label={`Rate ${v} out of 5`}
                          aria-pressed={scaleValue === v}
                        >
                          {v}
                        </Button>
                      ))}
                    </div>
                    <Button
                      size="lg"
                      className="w-full mt-2"
                      onClick={answerQuestion}
                      aria-label={`Submit rating of ${scaleValue}`}
                    >
                      Continue
                    </Button>
                  </div>
                )}

                {currentQ.type === 'boolean' && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-14 text-base border-white/20 text-white bg-green-900/30 hover:bg-green-800/40"
                      onClick={() => answerBoolean(true)}
                      aria-label="Yes"
                    >
                      Yes
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-14 text-base border-white/20 text-white bg-white/10 hover:bg-white/20"
                      onClick={() => answerBoolean(false)}
                      aria-label="No"
                    >
                      No
                    </Button>
                  </div>
                )}

                {currentQ.type === 'open' && (
                  <div className="space-y-2">
                    <textarea
                      value={openAnswer}
                      onChange={(e) => setOpenAnswer(e.target.value)}
                      placeholder="Take your time..."
                      rows={3}
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder:text-white/40 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label={currentQ.text}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        className="text-white/50 hover:text-white flex-1"
                        onClick={() => {
                          setOpenAnswer('');
                          answerQuestion();
                        }}
                        aria-label="Skip this question"
                      >
                        Skip
                      </Button>
                      <Button
                        size="lg"
                        className="flex-1"
                        onClick={answerQuestion}
                        aria-label="Submit answer and continue"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Check-in complete */}
          {sessionDone && (
            <Card className="bg-black/70 backdrop-blur-sm border-green-500/30">
              <CardContent className="pt-6 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" aria-hidden="true" />
                <p className="text-white font-semibold text-lg">Check-in complete</p>
                <p className="text-white/60 text-sm">
                  You showed up for yourself. That matters.
                </p>
                <Button
                  variant="outline"
                  className="border-white/20 text-white bg-white/10 w-full"
                  onClick={() => {
                    setActiveSession(null);
                    setSessionDone(false);
                  }}
                  aria-label="Return to bedroom overview"
                >
                  Back to bedroom
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ── Check-in selector (when no active session) ── */}
          {!activeSession && (
            <section aria-label="Daily check-ins">
              <h2 className="text-white/80 text-sm font-semibold mb-2 uppercase tracking-wide">
                Daily Check-Ins
              </h2>
              <div className="grid gap-2">
                {CHECK_IN_SESSIONS.map((session) => {
                  const Icon = session.Icon;
                  const isCurrent = session.period === currentPeriod;
                  return (
                    <Button
                      key={session.period}
                      variant="outline"
                      size="lg"
                      className={cn(
                        'h-14 justify-start gap-3 border-white/20 text-white',
                        isCurrent
                          ? 'bg-white/20 hover:bg-white/30 border-white/40'
                          : 'bg-white/5 hover:bg-white/15'
                      )}
                      onClick={() => startSession(session)}
                      aria-label={`Start ${session.label}`}
                      aria-current={isCurrent ? 'true' : undefined}
                    >
                      <Icon className={cn('w-5 h-5', session.color)} aria-hidden="true" />
                      <span className="font-medium">{session.label}</span>
                      {isCurrent && (
                        <span className="ml-auto text-xs text-white/50">Now</span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Goal tracking ── */}
          {!activeSession && (
            <section aria-label="Goal tracking" className="space-y-3">
              <h2 className="text-white/80 text-sm font-semibold uppercase tracking-wide">
                Your Goals
              </h2>

              {/* Long-term goal */}
              {goals
                .filter((g) => g.tier === 'long')
                .map((g) => (
                  <Card key={g.id} className="bg-purple-900/60 backdrop-blur-sm border-purple-500/30">
                    <CardContent className="flex items-center gap-3 py-4">
                      <Star className="w-5 h-5 text-purple-300 flex-shrink-0" aria-hidden="true" />
                      <div className="flex-1">
                        <p className="text-xs text-purple-300 font-semibold uppercase tracking-wide mb-0.5">
                          Long-term vision
                        </p>
                        <p className="text-white text-sm leading-snug">{g.text}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}

              {/* Medium goals */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/60 text-xs font-medium flex items-center gap-1">
                    <Target className="w-3 h-3" aria-hidden="true" />
                    Medium goals ({mediumDone}/{mediumTotal})
                  </p>
                  <Progress
                    value={(mediumDone / mediumTotal) * 100}
                    className="w-20 h-1.5"
                    aria-label={`${mediumDone} of ${mediumTotal} medium goals complete`}
                  />
                </div>
                <div className="space-y-2">
                  {goals
                    .filter((g) => g.tier === 'medium')
                    .map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center gap-3 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-3 border border-white/10"
                      >
                        <Checkbox
                          id={g.id}
                          checked={g.done}
                          onCheckedChange={() => toggleGoal(g.id)}
                          className="border-white/40 data-[state=checked]:bg-primary"
                          aria-label={g.text}
                        />
                        <label
                          htmlFor={g.id}
                          className={cn(
                            'text-sm text-white flex-1 cursor-pointer leading-snug',
                            g.done && 'line-through text-white/40'
                          )}
                        >
                          {g.text}
                        </label>
                      </div>
                    ))}
                </div>
              </div>

              {/* Small daily goals */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/60 text-xs font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" aria-hidden="true" />
                    Today&apos;s small steps ({smallDone}/{smallTotal})
                  </p>
                  <Progress
                    value={(smallDone / smallTotal) * 100}
                    className="w-20 h-1.5"
                    aria-label={`${smallDone} of ${smallTotal} daily steps complete`}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {goals
                    .filter((g) => g.tier === 'small')
                    .map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center gap-3 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2.5 border border-white/10"
                      >
                        <button
                          onClick={() => toggleGoal(g.id)}
                          aria-label={g.done ? `Mark "${g.text}" as not done` : `Mark "${g.text}" as done`}
                          aria-pressed={g.done}
                          className="flex-shrink-0 text-white/50 hover:text-white transition-colors"
                        >
                          {g.done ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" aria-hidden="true" />
                          ) : (
                            <Circle className="w-5 h-5" aria-hidden="true" />
                          )}
                        </button>
                        <span
                          className={cn(
                            'text-sm text-white leading-snug',
                            g.done && 'line-through text-white/40'
                          )}
                        >
                          {g.text}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-white/40 hover:text-white/60 w-full gap-1"
                onClick={() => {
                  const reset = goals.map((g) =>
                    g.tier === 'small' ? { ...g, done: false } : g
                  );
                  setGoals(reset);
                  say("Small goals reset for a fresh start.");
                }}
                aria-label="Reset daily small goals"
              >
                <RefreshCw className="w-3 h-3" aria-hidden="true" />
                Reset today&apos;s steps
              </Button>
            </section>
          )}

          <p className="text-white/20 text-xs text-center mt-2 pb-4">
            Rest is productive. You are enough.
          </p>
        </div>
      </main>

      <PanicButton variant="floating" />
    </div>
  );
}

// React needs to be in scope for JSX in createElement call
import React from 'react';
