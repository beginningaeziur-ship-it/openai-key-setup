import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { SAICharacter } from '@/components/aezuir/SAICharacter';
import { PanicButton } from '@/components/aezuir/PanicButton';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import {
  ChevronLeft,
  Trees,
  BookOpen,
  Heart,
  Users,
  Scale,
  CheckCircle2,
  Circle,
  ChevronRight,
  Info,
  Lightbulb,
  Shield,
} from 'lucide-react';
import forestBg from '@/assets/forest-woods-bg.jpg';

/**
 * Forest — Learning, nine-step program, and advocacy resources.
 *
 * Three sections:
 *  1. Nine Steps — trauma-informed recovery program, one step at a time
 *  2. Learn — bite-sized psychoeducation on trauma, PTSD, nervous system
 *  3. Advocate — rights, navigation tips for systems (housing, legal, medical)
 */

// ─── Nine Steps ───────────────────────────────────────────────────────────────

interface Step {
  number: number;
  title: string;
  tagline: string;
  body: string;
  practices: string[];
}

const NINE_STEPS: Step[] = [
  {
    number: 1,
    title: 'Safety First',
    tagline: 'Before healing can begin, safety must exist.',
    body: 'Trauma recovery cannot start until you have a basic sense of physical and emotional safety. This does not mean perfection — it means enough safety to breathe.',
    practices: [
      'Identify one person or space that feels safe to you.',
      'Practice one grounding tool each day this week.',
      'Notice what helps you feel safer — more space, quiet, light.',
    ],
  },
  {
    number: 2,
    title: 'Stabilization',
    tagline: 'Build the skills to ride the waves.',
    body: 'Stabilization means developing tools that help you manage overwhelming feelings without pushing them all away or being consumed by them.',
    practices: [
      'Learn one breathing technique and use it daily.',
      'Keep a brief daily check-in (one word or number is enough).',
      'Identify two things that help when emotions feel big.',
    ],
  },
  {
    number: 3,
    title: 'Recognizing Trauma Responses',
    tagline: 'Your reactions make sense.',
    body: 'Fight, flight, freeze, and fawn are survival responses, not flaws. Understanding your own patterns helps you respond rather than react.',
    practices: [
      'Notice when your body shifts — heart rate, breathing, muscle tension.',
      'Journal one observation about your responses this week.',
      'Remind yourself: this response protected you once.',
    ],
  },
  {
    number: 4,
    title: 'Processing Grief',
    tagline: 'What was lost deserves to be mourned.',
    body: 'Trauma involves loss — of safety, of trust, of time, of self. Grief is not weakness. It is the acknowledgment that something mattered.',
    practices: [
      'Name one thing you have lost that you have not grieved.',
      'Allow yourself to sit with one feeling for five minutes.',
      'Be gentle with yourself on hard days.',
    ],
  },
  {
    number: 5,
    title: 'Rebuilding Trust',
    tagline: 'Trust begins with yourself.',
    body: 'Trauma often breaks our trust in ourselves and others. Rebuilding starts small — noticing when you keep a promise to yourself.',
    practices: [
      'Keep one small promise to yourself each day.',
      'Notice one person in your life who is consistent and safe.',
      'Practice self-trust in low-stakes situations first.',
    ],
  },
  {
    number: 6,
    title: 'Setting Boundaries',
    tagline: 'Boundaries are how we love ourselves.',
    body: 'Boundaries are not walls — they are the lines that tell others how to treat you. They protect your energy and your healing.',
    practices: [
      'Identify one boundary you want to set.',
      'Practice saying "no" or "not now" to one low-stakes thing.',
      'Notice how your body feels when a boundary is crossed.',
    ],
  },
  {
    number: 7,
    title: 'Connection and Community',
    tagline: 'Healing happens in relationship.',
    body: 'We are wired for connection. Isolation can maintain trauma. Even one safe, consistent relationship supports recovery.',
    practices: [
      'Reach out to one person this week, even briefly.',
      'Consider a support group (online or in person).',
      'Allow SAI to be a practice space for connection.',
    ],
  },
  {
    number: 8,
    title: 'Finding Meaning',
    tagline: 'Your story is not over.',
    body: 'Many survivors find meaning in their experience over time — not that trauma was "good," but that something worthwhile came from surviving it.',
    practices: [
      'Write down one strength that came from your experience.',
      'Consider what you would tell someone in a similar situation.',
      'Explore what matters most to you going forward.',
    ],
  },
  {
    number: 9,
    title: 'Post-Traumatic Growth',
    tagline: 'You survived. Now you get to decide what comes next.',
    body: 'Growth after trauma does not erase what happened. It means you are more than what was done to you. You have agency in your next chapter.',
    practices: [
      'Define your long-term vision in your own words.',
      'Identify one goal that excites you, even a little.',
      'Celebrate the progress you have already made.',
    ],
  },
];

// ─── Learn Articles ────────────────────────────────────────────────────────────

interface Article {
  id: string;
  title: string;
  category: string;
  content: string[];
  keyPoints: string[];
}

const ARTICLES: Article[] = [
  {
    id: 'nervous-system',
    title: 'Your Nervous System and Trauma',
    category: 'Foundations',
    content: [
      'The nervous system is your body\'s alarm system. In trauma, this alarm can become stuck in the "on" position — always scanning for danger even when you are safe.',
      'This is not a malfunction. It is your brain doing exactly what it evolved to do: keep you alive.',
      'With time and the right tools, the alarm can learn to reset. This is called nervous system regulation.',
    ],
    keyPoints: [
      'Hyperarousal: on edge, hypervigilant, easily startled',
      'Hypoarousal: shut down, numb, dissociated',
      'Window of tolerance: the range where we can cope',
      'Regulation tools: breathing, grounding, movement',
    ],
  },
  {
    id: 'ptsd-basics',
    title: 'Understanding PTSD',
    category: 'Foundations',
    content: [
      'PTSD (Post-Traumatic Stress Disorder) develops when the brain gets "stuck" processing a traumatic event. It is not about being weak — it is about having a very strong survival system.',
      'Common experiences include flashbacks, nightmares, avoidance, emotional numbness, and hypervigilance.',
      'PTSD is treatable. Many people recover with appropriate support.',
    ],
    keyPoints: [
      'Re-experiencing: flashbacks, intrusive memories',
      'Avoidance: staying away from reminders',
      'Negative thoughts: shame, guilt, hopelessness',
      'Arousal changes: sleep issues, irritability, startle response',
    ],
  },
  {
    id: 'trauma-body',
    title: 'Trauma Lives in the Body',
    category: 'Mind-Body',
    content: [
      'Trauma is not only a psychological experience — it is stored in the body. Physical symptoms like chronic pain, fatigue, tension, and digestive issues can all be trauma responses.',
      'This is why talk therapy alone is sometimes not enough. The body needs its own healing — through movement, breath, touch, and rest.',
      'Paying attention to your body\'s signals is part of recovery, not a distraction from it.',
    ],
    keyPoints: [
      'Physical tension often mirrors emotional pain',
      'Somatic awareness helps identify triggers early',
      'Body-based practices support nervous system healing',
      'Rest and nourishment are part of trauma recovery',
    ],
  },
  {
    id: 'cptsd',
    title: 'Complex Trauma (C-PTSD)',
    category: 'Foundations',
    content: [
      'Complex PTSD (C-PTSD) develops from prolonged, repeated trauma — often in childhood, in relationships, or in situations where escape was not possible.',
      'It includes the symptoms of PTSD plus difficulties with emotional regulation, self-perception, and relationships.',
      'C-PTSD is valid and recognized. It requires a thoughtful, paced approach to healing — exactly what Aezuir is designed to support.',
    ],
    keyPoints: [
      'Often comes from repeated, interpersonal trauma',
      'Affects sense of self, shame, and identity',
      'Healing is possible, though it takes time',
      'Safety and stabilization come before trauma processing',
    ],
  },
];

// ─── Advocacy Resources ───────────────────────────────────────────────────────

interface AdvocacyTip {
  id: string;
  title: string;
  Icon: React.ElementType;
  color: string;
  tips: string[];
}

const ADVOCACY_TIPS: AdvocacyTip[] = [
  {
    id: 'rights',
    title: 'Your Rights',
    Icon: Scale,
    color: 'text-amber-400',
    tips: [
      'You have the right to ask questions and receive answers in plain language.',
      'You can request an advocate or support person at medical appointments.',
      'You have the right to refuse treatment and to ask for alternatives.',
      'In housing: you have the right to reasonable accommodations for disability.',
      'You can request written copies of any documents you sign.',
    ],
  },
  {
    id: 'medical',
    title: 'Medical Navigation',
    Icon: Heart,
    color: 'text-red-400',
    tips: [
      'Write down questions before appointments — you will likely forget under stress.',
      'Bring someone you trust when possible.',
      'You can ask the doctor to explain again if you did not understand.',
      'Request that trauma-informed care be noted in your file.',
      'If you cannot afford care, ask about sliding-scale fees or community health centers.',
    ],
  },
  {
    id: 'housing',
    title: 'Housing Navigation',
    Icon: Shield,
    color: 'text-blue-400',
    tips: [
      '211 connects you to local housing resources.',
      'You may qualify for Section 8, HUD-VASH, or disability housing vouchers.',
      'Domestic violence survivors often have priority for emergency housing.',
      'Legal aid can help if you are facing eviction.',
      'Document everything: dates, names, conversations.',
    ],
  },
  {
    id: 'peer',
    title: 'Peer Support',
    Icon: Users,
    color: 'text-green-400',
    tips: [
      'Peer support specialists have lived experience with mental health or addiction.',
      'NAMI, DBSA, and other organizations offer free peer support groups.',
      'Online communities can provide connection when in-person is not safe.',
      'You are not alone — millions of people share similar experiences.',
      'Being a peer supporter yourself can be part of your healing.',
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Forest() {
  const navigate = useNavigate();
  const { speak, voiceEnabled, isSpeaking } = useVoiceSettings();

  const [activeTab, setActiveTab] = useState<'steps' | 'learn' | 'advocate'>('steps');
  const [saiMessage, setSaiMessage] = useState(
    "The forest is a place of learning and growth. Take what you need."
  );

  // Nine steps state
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const saved = localStorage.getItem('aezuir_nine_steps_current');
    return saved ? parseInt(saved) : 1;
  });
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    const saved = localStorage.getItem('aezuir_nine_steps_done');
    return saved ? JSON.parse(saved) : [];
  });
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  // Learn state
  const [openArticle, setOpenArticle] = useState<Article | null>(null);

  // Advocate state
  const [openAdvocacy, setOpenAdvocacy] = useState<AdvocacyTip | null>(null);

  const say = useCallback(
    (msg: string) => {
      setSaiMessage(msg);
      if (voiceEnabled) speak(msg);
    },
    [voiceEnabled, speak]
  );

  const markStepComplete = useCallback(
    (stepNumber: number) => {
      const updated = completedSteps.includes(stepNumber)
        ? completedSteps.filter((s) => s !== stepNumber)
        : [...completedSteps, stepNumber];
      setCompletedSteps(updated);
      localStorage.setItem('aezuir_nine_steps_done', JSON.stringify(updated));

      if (!completedSteps.includes(stepNumber)) {
        // Completing
        const nextStep = Math.min(stepNumber + 1, 9);
        setCurrentStep(nextStep);
        localStorage.setItem('aezuir_nine_steps_current', nextStep.toString());
        const step = NINE_STEPS.find((s) => s.number === stepNumber);
        say(`Step ${stepNumber}, ${step?.title}, marked complete. You are making progress.`);
      }
    },
    [completedSteps, say]
  );

  const saiState = isSpeaking ? 'speaking' : 'attentive';
  const progressPercent = (completedSteps.length / 9) * 100;

  return (
    <div
      className="min-h-screen relative flex flex-col"
      style={{
        backgroundImage: `url(${forestBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-green-900/50 via-black/30 to-green-900/60" aria-hidden="true" />

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
              <Trees className="w-5 h-5 text-green-300" aria-hidden="true" />
              <span className="font-semibold text-white">Forest</span>
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

          {/* SAI message */}
          <div
            role="status"
            aria-live="polite"
            className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-green-500/20"
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
                value="steps"
                className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20"
                aria-label="Nine-step program"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" aria-hidden="true" />
                <span className="hidden sm:inline">9 Steps</span>
              </TabsTrigger>
              <TabsTrigger
                value="learn"
                className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20"
                aria-label="Learning articles"
              >
                <BookOpen className="w-4 h-4 mr-1" aria-hidden="true" />
                <span className="hidden sm:inline">Learn</span>
              </TabsTrigger>
              <TabsTrigger
                value="advocate"
                className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20"
                aria-label="Advocacy resources"
              >
                <Shield className="w-4 h-4 mr-1" aria-hidden="true" />
                <span className="hidden sm:inline">Advocate</span>
              </TabsTrigger>
            </TabsList>

            {/* ── NINE STEPS ── */}
            <TabsContent value="steps" className="mt-4 space-y-4">
              {/* Overall progress */}
              <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-green-500/20">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-white text-sm font-semibold">Your Journey</p>
                  <p className="text-green-300 text-sm font-bold">
                    {completedSteps.length} / 9 steps
                  </p>
                </div>
                <Progress
                  value={progressPercent}
                  className="h-2"
                  aria-label={`${completedSteps.length} of 9 steps complete`}
                />
              </div>

              {/* Step list */}
              <div className="space-y-2">
                {NINE_STEPS.map((step) => {
                  const done = completedSteps.includes(step.number);
                  const isCurrent = step.number === currentStep;
                  const isExpanded = expandedStep === step.number;
                  const isLocked = step.number > currentStep && !done;

                  return (
                    <Card
                      key={step.number}
                      className={cn(
                        'backdrop-blur-sm border transition-all',
                        done
                          ? 'bg-green-900/40 border-green-500/30'
                          : isCurrent
                          ? 'bg-black/60 border-white/30'
                          : isLocked
                          ? 'bg-black/30 border-white/10 opacity-60'
                          : 'bg-black/50 border-white/20'
                      )}
                    >
                      <CardHeader className="pb-0 pt-4 px-4">
                        <button
                          onClick={() => {
                            if (isLocked) {
                              say(`Step ${step.number} will unlock as you progress.`);
                              return;
                            }
                            setExpandedStep(isExpanded ? null : step.number);
                          }}
                          aria-expanded={isExpanded}
                          aria-label={`${done ? 'Completed: ' : isCurrent ? 'Current: ' : ''}Step ${step.number}: ${step.title}`}
                          className="w-full text-left flex items-center gap-3 focus:outline-none"
                        >
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold',
                              done
                                ? 'bg-green-500 text-white'
                                : isCurrent
                                ? 'bg-primary text-white'
                                : 'bg-white/10 text-white/50'
                            )}
                            aria-hidden="true"
                          >
                            {done ? '✓' : step.number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn('font-semibold text-sm', done ? 'text-green-300' : 'text-white')}>
                              {step.title}
                            </p>
                            <p className="text-white/50 text-xs truncate">{step.tagline}</p>
                          </div>
                          {!isLocked && (
                            <ChevronRight
                              className={cn(
                                'w-4 h-4 text-white/40 flex-shrink-0 transition-transform',
                                isExpanded && 'rotate-90'
                              )}
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      </CardHeader>

                      {isExpanded && !isLocked && (
                        <CardContent className="pt-3 pb-4 px-4 space-y-3">
                          <p className="text-white/80 text-sm leading-relaxed">{step.body}</p>

                          <div>
                            <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-2">
                              Practices
                            </p>
                            <ul className="space-y-1">
                              {step.practices.map((p, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                                  <Lightbulb className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                  {p}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <Button
                            size="sm"
                            variant={done ? 'outline' : 'default'}
                            className={cn(
                              'w-full',
                              done && 'border-green-500/30 text-green-300 bg-green-900/20'
                            )}
                            onClick={() => markStepComplete(step.number)}
                            aria-label={done ? `Mark step ${step.number} as incomplete` : `Mark step ${step.number} as complete`}
                          >
                            {done ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-2" aria-hidden="true" />
                                Mark incomplete
                              </>
                            ) : (
                              <>
                                <Circle className="w-4 h-4 mr-2" aria-hidden="true" />
                                Mark complete
                              </>
                            )}
                          </Button>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* ── LEARN ── */}
            <TabsContent value="learn" className="mt-4 space-y-3">
              {openArticle ? (
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    className="text-white/60 hover:text-white -ml-2"
                    onClick={() => setOpenArticle(null)}
                    aria-label="Back to article list"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
                    Back
                  </Button>

                  <Card className="bg-black/60 backdrop-blur-sm border-green-500/20">
                    <CardHeader>
                      <p className="text-green-300 text-xs font-semibold uppercase tracking-wide">
                        {openArticle.category}
                      </p>
                      <CardTitle className="text-white text-lg">{openArticle.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {openArticle.content.map((para, i) => (
                        <p key={i} className="text-white/80 text-sm leading-relaxed">
                          {para}
                        </p>
                      ))}

                      <div className="border-t border-white/10 pt-4">
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-2">
                          Key Points
                        </p>
                        <ul className="space-y-1.5">
                          {openArticle.keyPoints.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                              <Info className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                ARTICLES.map((article) => (
                  <Card
                    key={article.id}
                    className="bg-black/50 backdrop-blur-sm border-green-500/20 hover:border-green-400/40 cursor-pointer transition-all"
                    onClick={() => {
                      setOpenArticle(article);
                      say(`Opening: ${article.title}`);
                    }}
                  >
                    <CardContent className="py-4">
                      <button
                        className="w-full text-left focus:outline-none"
                        aria-label={`Read article: ${article.title}`}
                      >
                        <p className="text-green-300 text-xs font-semibold uppercase tracking-wide mb-1">
                          {article.category}
                        </p>
                        <p className="text-white font-semibold">{article.title}</p>
                        <p className="text-white/60 text-sm mt-1 line-clamp-2">
                          {article.content[0]}
                        </p>
                      </button>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* ── ADVOCATE ── */}
            <TabsContent value="advocate" className="mt-4 space-y-3">
              {openAdvocacy ? (
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    className="text-white/60 hover:text-white -ml-2"
                    onClick={() => setOpenAdvocacy(null)}
                    aria-label="Back to advocacy list"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
                    Back
                  </Button>

                  <Card className="bg-black/60 backdrop-blur-sm border-green-500/20">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        {(() => {
                          const Icon = openAdvocacy.Icon;
                          return <Icon className={cn('w-5 h-5', openAdvocacy.color)} aria-hidden="true" />;
                        })()}
                        {openAdvocacy.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {openAdvocacy.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-white/80 leading-relaxed">
                            <div
                              className="w-5 h-5 rounded-full bg-green-900/50 flex items-center justify-center flex-shrink-0 text-green-300 text-xs font-bold"
                              aria-hidden="true"
                            >
                              {i + 1}
                            </div>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                ADVOCACY_TIPS.map((tip) => {
                  const Icon = tip.Icon;
                  return (
                    <Card
                      key={tip.id}
                      className="bg-black/50 backdrop-blur-sm border-green-500/20 hover:border-green-400/40 cursor-pointer transition-all"
                      onClick={() => {
                        setOpenAdvocacy(tip);
                        say(`Opening ${tip.title}`);
                      }}
                    >
                      <CardContent className="py-4">
                        <button
                          className="w-full text-left focus:outline-none flex items-center gap-3"
                          aria-label={`Open ${tip.title} tips`}
                        >
                          <Icon className={cn('w-6 h-6', tip.color)} aria-hidden="true" />
                          <div>
                            <p className="text-white font-semibold">{tip.title}</p>
                            <p className="text-white/50 text-xs">{tip.tips.length} tips</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/30 ml-auto" aria-hidden="true" />
                        </button>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>

          <p className="text-white/20 text-xs text-center mt-2 pb-4">
            Growth is not linear. Every step forward counts.
          </p>
        </div>
      </main>

      <PanicButton variant="floating" />
    </div>
  );
}
