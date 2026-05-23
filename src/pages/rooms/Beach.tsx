import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SAICharacter } from '@/components/aezuir/SAICharacter';
import { PanicButton } from '@/components/aezuir/PanicButton';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import {
  ChevronLeft,
  Waves,
  Wind,
  Eye,
  Hand,
  Ear,
  Sun,
  Flower2,
  Heart,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import oceanBg from '@/assets/tropical-ocean-bg.jpg';

/**
 * Beach — Grounding tools and breathing exercises.
 *
 * Three tool sets:
 *  1. Breathing — 4-7-8 and box breathing, animated visual guide
 *  2. Sensory grounding — 5-4-3-2-1 technique with prompts
 *  3. Calm anchors — body scan, safe-place visualisation, affirmations
 *
 * Designed for quick access during distress — no unnecessary steps.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

type BreathPattern = {
  id: string;
  name: string;
  description: string;
  phases: { label: string; seconds: number }[];
};

type GroundingStep = {
  count: number;
  sense: string;
  Icon: React.ElementType;
  prompt: string;
  examples: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const BREATH_PATTERNS: BreathPattern[] = [
  {
    id: '478',
    name: '4-7-8 Breathing',
    description: 'Calms the nervous system. Inhale 4, hold 7, exhale 8.',
    phases: [
      { label: 'Inhale', seconds: 4 },
      { label: 'Hold', seconds: 7 },
      { label: 'Exhale', seconds: 8 },
    ],
  },
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Used by first responders. Equal counts, steady rhythm.',
    phases: [
      { label: 'Inhale', seconds: 4 },
      { label: 'Hold', seconds: 4 },
      { label: 'Exhale', seconds: 4 },
      { label: 'Hold', seconds: 4 },
    ],
  },
  {
    id: 'simple',
    name: 'Simple Breath',
    description: 'Just breathe in and out slowly. No counting needed.',
    phases: [
      { label: 'Breathe in', seconds: 5 },
      { label: 'Breathe out', seconds: 5 },
    ],
  },
];

const GROUNDING_STEPS: GroundingStep[] = [
  {
    count: 5,
    sense: 'See',
    Icon: Eye,
    prompt: 'Name 5 things you can see right now.',
    examples: 'A wall, a light, your hands, a shadow, the floor.',
  },
  {
    count: 4,
    sense: 'Touch',
    Icon: Hand,
    prompt: 'Name 4 things you can feel or touch.',
    examples: 'Your chair, the temperature of the air, your clothing, the ground.',
  },
  {
    count: 3,
    sense: 'Hear',
    Icon: Ear,
    prompt: 'Name 3 things you can hear.',
    examples: 'Your breathing, background sounds, your heartbeat.',
  },
  {
    count: 2,
    sense: 'Smell',
    Icon: Wind,
    prompt: 'Name 2 things you can smell.',
    examples: 'The room, your clothing, food nearby.',
  },
  {
    count: 1,
    sense: 'Taste',
    Icon: Sun,
    prompt: 'Name 1 thing you can taste.',
    examples: 'What is in your mouth right now?',
  },
];

const AFFIRMATIONS = [
  "I am safe in this moment.",
  "This feeling will pass. I have survived before.",
  "My body is trying to protect me. I can thank it and let it rest.",
  "I don't have to solve everything right now.",
  "I am allowed to take up space.",
  "I can breathe through this.",
  "I am not alone, even when it feels that way.",
  "Small steps count. I am doing enough.",
];

const BODY_SCAN_STEPS = [
  "Start at your feet. Notice the ground beneath them.",
  "Move to your legs. Are they tense or relaxed? Let them soften.",
  "Notice your belly. Take one slow breath and let it expand.",
  "Move to your shoulders. Let them drop away from your ears.",
  "Notice your jaw and face. Unclench. Soften.",
  "Feel the whole of your body, held by what you're sitting or standing on.",
  "You are here. You are present. You are safe right now.",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Beach() {
  const navigate = useNavigate();
  const { speak, voiceEnabled, isSpeaking } = useVoiceSettings();

  const [activeTab, setActiveTab] = useState<'breathing' | 'grounding' | 'anchors'>('breathing');
  const [saiMessage, setSaiMessage] = useState(
    "The waves are always here. Take whatever you need."
  );

  // Breathing state
  const [selectedPattern, setSelectedPattern] = useState<BreathPattern | null>(null);
  const [breathPhaseIndex, setBreathPhaseIndex] = useState(0);
  const [breathSecondsLeft, setBreathSecondsLeft] = useState(0);
  const [breathCycles, setBreathCycles] = useState(0);
  const [breathActive, setBreathActive] = useState(false);
  const breathTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Grounding state
  const [groundingStep, setGroundingStep] = useState<number | null>(null);
  const [groundingDone, setGroundingDone] = useState(false);

  // Anchors state
  const [bodyScanStep, setBodyScanStep] = useState<number | null>(null);
  const [currentAffirmation, setCurrentAffirmation] = useState('');

  const say = useCallback(
    (msg: string) => {
      setSaiMessage(msg);
      if (voiceEnabled) speak(msg);
    },
    [voiceEnabled, speak]
  );

  // ── Breathing ──
  const stopBreathing = useCallback(() => {
    setBreathActive(false);
    if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    setSelectedPattern(null);
    setBreathCycles(0);
    say("Breathing exercise paused. Take your time.");
  }, [say]);

  const startBreathing = useCallback(
    (pattern: BreathPattern) => {
      setSelectedPattern(pattern);
      setBreathPhaseIndex(0);
      setBreathSecondsLeft(pattern.phases[0].seconds);
      setBreathCycles(0);
      setBreathActive(true);
      say(`Starting ${pattern.name}. Follow the circle.`);
    },
    [say]
  );

  // Breathing timer
  useEffect(() => {
    if (!breathActive || !selectedPattern) return;

    const tick = () => {
      setBreathSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        // Move to next phase
        setBreathPhaseIndex((pi) => {
          const next = (pi + 1) % selectedPattern.phases.length;
          const nextPhase = selectedPattern.phases[next];
          setBreathSecondsLeft(nextPhase.seconds);

          if (next === 0) {
            setBreathCycles((c) => {
              if (c + 1 >= 4) {
                // 4 cycles done
                setTimeout(() => {
                  setBreathActive(false);
                  setSelectedPattern(null);
                  say("Four cycles complete. Well done. Notice how you feel.");
                }, 500);
              }
              return c + 1;
            });
          }
          return next;
        });
        return selectedPattern.phases[0].seconds; // temp, overridden above
      });
    };

    breathTimerRef.current = setTimeout(tick, 1000);
    return () => {
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    };
  }, [breathActive, selectedPattern, breathSecondsLeft, say]);

  const currentPhase = selectedPattern ? selectedPattern.phases[breathPhaseIndex] : null;
  const isInhale = currentPhase?.label.toLowerCase().includes('inhale') || currentPhase?.label.toLowerCase().includes('in');
  const isExhale = currentPhase?.label.toLowerCase().includes('exhale') || currentPhase?.label.toLowerCase().includes('out');

  // ── Grounding ──
  const startGrounding = useCallback(() => {
    setGroundingStep(0);
    setGroundingDone(false);
    say(GROUNDING_STEPS[0].prompt);
  }, [say]);

  const nextGroundingStep = useCallback(() => {
    if (groundingStep === null) return;
    if (groundingStep < GROUNDING_STEPS.length - 1) {
      const next = groundingStep + 1;
      setGroundingStep(next);
      say(GROUNDING_STEPS[next].prompt);
    } else {
      setGroundingStep(null);
      setGroundingDone(true);
      say("You did all five senses. You are grounded, right here, right now. Well done.");
    }
  }, [groundingStep, say]);

  // ── Anchors ──
  const startBodyScan = useCallback(() => {
    setBodyScanStep(0);
    say(BODY_SCAN_STEPS[0]);
  }, [say]);

  const nextBodyScanStep = useCallback(() => {
    if (bodyScanStep === null) return;
    if (bodyScanStep < BODY_SCAN_STEPS.length - 1) {
      const next = bodyScanStep + 1;
      setBodyScanStep(next);
      say(BODY_SCAN_STEPS[next]);
    } else {
      setBodyScanStep(null);
      say("Body scan complete. You are present. You are here.");
    }
  }, [bodyScanStep, say]);

  const getAffirmation = useCallback(() => {
    const a = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
    setCurrentAffirmation(a);
    say(a);
  }, [say]);

  const saiState = isSpeaking ? 'speaking' : breathActive ? 'happy' : 'attentive';

  return (
    <div
      className="min-h-screen relative flex flex-col"
      style={{
        backgroundImage: `url(${oceanBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/40 via-black/20 to-cyan-900/50" aria-hidden="true" />

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
              <Waves className="w-5 h-5 text-cyan-300" aria-hidden="true" />
              <span className="font-semibold text-white">Beach</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col p-4 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full flex flex-col gap-4">

          {/* SAI */}
          <div className="flex justify-center">
            <SAICharacter state={saiState} size="md" showBreathing={!breathActive} />
          </div>

          {/* SAI message */}
          <div
            role="status"
            aria-live="polite"
            className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/20"
          >
            <p className="text-white text-sm leading-relaxed text-center">{saiMessage}</p>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          >
            <TabsList className="grid grid-cols-3 bg-black/40 backdrop-blur-sm border border-white/10">
              <TabsTrigger
                value="breathing"
                className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20"
                aria-label="Breathing exercises"
              >
                <Wind className="w-4 h-4 mr-1" aria-hidden="true" />
                <span className="hidden sm:inline">Breathe</span>
              </TabsTrigger>
              <TabsTrigger
                value="grounding"
                className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20"
                aria-label="Sensory grounding 5-4-3-2-1"
              >
                <Eye className="w-4 h-4 mr-1" aria-hidden="true" />
                <span className="hidden sm:inline">Ground</span>
              </TabsTrigger>
              <TabsTrigger
                value="anchors"
                className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20"
                aria-label="Calm anchors: body scan and affirmations"
              >
                <Heart className="w-4 h-4 mr-1" aria-hidden="true" />
                <span className="hidden sm:inline">Anchor</span>
              </TabsTrigger>
            </TabsList>

            {/* ── BREATHING ── */}
            <TabsContent value="breathing" className="mt-4 space-y-4">
              {breathActive && selectedPattern ? (
                <Card className="bg-black/60 backdrop-blur-sm border-cyan-500/30">
                  <CardContent className="pt-6 flex flex-col items-center gap-4">
                    {/* Animated circle */}
                    <div
                      aria-label={`${currentPhase?.label}: ${breathSecondsLeft} seconds`}
                      role="timer"
                      className={cn(
                        'w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center',
                        'transition-all duration-1000',
                        isInhale
                          ? 'scale-125 border-cyan-400 bg-cyan-400/20'
                          : isExhale
                          ? 'scale-75 border-blue-400 bg-transparent'
                          : 'scale-100 border-purple-400 bg-purple-400/10'
                      )}
                    >
                      <span className="text-white font-bold text-lg capitalize">
                        {currentPhase?.label}
                      </span>
                      <span className="text-white/60 text-2xl font-bold tabular-nums">
                        {breathSecondsLeft}
                      </span>
                    </div>

                    <p className="text-white/60 text-sm">
                      Cycle {Math.min(breathCycles + 1, 4)} of 4
                    </p>

                    <Button
                      variant="outline"
                      className="border-white/20 text-white bg-white/10"
                      onClick={stopBreathing}
                      aria-label="Stop breathing exercise"
                    >
                      Stop
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {BREATH_PATTERNS.map((p) => (
                    <Card
                      key={p.id}
                      className="bg-black/50 backdrop-blur-sm border-cyan-500/20 hover:border-cyan-400/40 cursor-pointer transition-all"
                      onClick={() => startBreathing(p)}
                    >
                      <CardContent className="py-4">
                        <button
                          className="w-full text-left focus:outline-none"
                          onClick={() => startBreathing(p)}
                          aria-label={`Start ${p.name}: ${p.description}`}
                        >
                          <p className="text-white font-semibold mb-1">{p.name}</p>
                          <p className="text-white/60 text-sm">{p.description}</p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {p.phases.map((phase, i) => (
                              <span
                                key={i}
                                className="text-xs bg-cyan-900/40 text-cyan-300 rounded-full px-2 py-0.5"
                              >
                                {phase.label} {phase.seconds}s
                              </span>
                            ))}
                          </div>
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── GROUNDING ── */}
            <TabsContent value="grounding" className="mt-4 space-y-4">
              {groundingDone ? (
                <Card className="bg-black/60 backdrop-blur-sm border-green-500/30">
                  <CardContent className="pt-6 text-center space-y-4">
                    <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" aria-hidden="true" />
                    <p className="text-white font-semibold">5-4-3-2-1 Complete</p>
                    <p className="text-white/60 text-sm">
                      You used all five senses. You are present, right here, right now.
                    </p>
                    <Button
                      variant="outline"
                      className="border-white/20 text-white bg-white/10 w-full"
                      onClick={() => { setGroundingDone(false); setGroundingStep(null); }}
                      aria-label="Reset grounding exercise"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                      Do it again
                    </Button>
                  </CardContent>
                </Card>
              ) : groundingStep !== null ? (
                <Card className="bg-black/60 backdrop-blur-sm border-cyan-500/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-base flex items-center gap-2">
                        {(() => {
                          const step = GROUNDING_STEPS[groundingStep];
                          const Icon = step.Icon;
                          return (
                            <>
                              <Icon className="w-5 h-5 text-cyan-300" aria-hidden="true" />
                              {step.count} things you {step.sense}
                            </>
                          );
                        })()}
                      </CardTitle>
                      <span className="text-white/50 text-xs">
                        {groundingStep + 1} / 5
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-white leading-relaxed">
                      {GROUNDING_STEPS[groundingStep].prompt}
                    </p>
                    <p className="text-white/50 text-xs italic">
                      Examples: {GROUNDING_STEPS[groundingStep].examples}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        className="text-white/50 hover:text-white"
                        onClick={() => { setGroundingStep(null); }}
                        aria-label="Stop grounding exercise"
                      >
                        Stop
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={nextGroundingStep}
                        aria-label={
                          groundingStep < GROUNDING_STEPS.length - 1
                            ? 'Next grounding step'
                            : 'Complete grounding exercise'
                        }
                      >
                        {groundingStep < GROUNDING_STEPS.length - 1 ? 'Next' : 'Complete'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-black/50 backdrop-blur-sm border-cyan-500/20">
                  <CardContent className="pt-6 space-y-4">
                    <div className="text-center">
                      <p className="text-white font-bold text-lg mb-2">5-4-3-2-1 Grounding</p>
                      <p className="text-white/60 text-sm">
                        Use your five senses to anchor yourself to the present moment.
                        Works anywhere, any time.
                      </p>
                    </div>
                    <div className="flex justify-center gap-3 flex-wrap">
                      {GROUNDING_STEPS.map((s) => {
                        const Icon = s.Icon;
                        return (
                          <div
                            key={s.sense}
                            className="flex flex-col items-center gap-1"
                            aria-hidden="true"
                          >
                            <div className="w-10 h-10 rounded-full bg-cyan-900/40 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-cyan-300" />
                            </div>
                            <span className="text-white/60 text-xs">{s.count}</span>
                          </div>
                        );
                      })}
                    </div>
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={startGrounding}
                      aria-label="Start 5-4-3-2-1 grounding exercise"
                    >
                      Start Grounding
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ── ANCHORS ── */}
            <TabsContent value="anchors" className="mt-4 space-y-3">
              {/* Affirmation */}
              <Card className="bg-black/50 backdrop-blur-sm border-purple-500/20">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Flower2 className="w-4 h-4 text-purple-300" aria-hidden="true" />
                    <p className="text-white font-semibold">Affirmation</p>
                  </div>
                  {currentAffirmation ? (
                    <blockquote
                      aria-live="polite"
                      className="text-white/90 text-base italic leading-relaxed border-l-2 border-purple-400 pl-4"
                    >
                      "{currentAffirmation}"
                    </blockquote>
                  ) : (
                    <p className="text-white/50 text-sm">
                      Tap the button for a grounding affirmation.
                    </p>
                  )}
                  <Button
                    variant="outline"
                    className="border-purple-500/30 text-white bg-purple-900/20 hover:bg-purple-900/40 w-full"
                    onClick={getAffirmation}
                    aria-label="Get a new affirmation"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                    {currentAffirmation ? 'New affirmation' : 'Get affirmation'}
                  </Button>
                </CardContent>
              </Card>

              {/* Body scan */}
              {bodyScanStep !== null ? (
                <Card className="bg-black/60 backdrop-blur-sm border-indigo-500/30">
                  <CardContent className="pt-6 space-y-4">
                    <p className="text-white leading-relaxed text-base">
                      {BODY_SCAN_STEPS[bodyScanStep]}
                    </p>
                    <p className="text-white/40 text-xs">
                      Step {bodyScanStep + 1} of {BODY_SCAN_STEPS.length}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        className="text-white/50 hover:text-white"
                        onClick={() => setBodyScanStep(null)}
                        aria-label="Stop body scan"
                      >
                        Stop
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={nextBodyScanStep}
                        aria-label={
                          bodyScanStep < BODY_SCAN_STEPS.length - 1
                            ? 'Next body scan step'
                            : 'Complete body scan'
                        }
                      >
                        {bodyScanStep < BODY_SCAN_STEPS.length - 1 ? 'Continue' : 'Finish'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-black/50 backdrop-blur-sm border-indigo-500/20">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-indigo-300" aria-hidden="true" />
                      <p className="text-white font-semibold">Body Scan</p>
                    </div>
                    <p className="text-white/60 text-sm">
                      A gentle scan from feet to face, releasing tension and returning
                      to the present moment.
                    </p>
                    <Button
                      variant="outline"
                      className="border-indigo-500/30 text-white bg-indigo-900/20 hover:bg-indigo-900/40 w-full"
                      onClick={startBodyScan}
                      aria-label="Start guided body scan"
                    >
                      Begin body scan
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <p className="text-white/20 text-xs text-center mt-2 pb-4">
            The ocean doesn't judge. Neither does SAI.
          </p>
        </div>
      </main>

      <PanicButton variant="floating" />
    </div>
  );
}
