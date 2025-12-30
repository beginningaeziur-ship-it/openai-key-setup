import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useSAI } from '@/contexts/SAIContext';
import { FullBodySAI } from '@/components/sai/FullBodySAI';
import { 
  Home, 
  Wind, 
  BookOpen, 
  Waves, 
  Eye, 
  Ear, 
  Hand,
  Sun,
  Save,
  X,
  ChevronLeft
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import oceanBg from '@/assets/tropical-ocean-bg.jpg';

/**
 * BeachScene - Grounding, meditation, and journaling
 * 
 * Purpose: Calm space for sensory grounding and reflection
 * Features:
 * - 5-4-3-2-1 grounding exercise
 * - Breathing exercises with wave rhythm
 * - Simple journaling (save to phone option)
 * - Meditation prompts
 */

interface GroundingStep {
  count: number;
  sense: string;
  icon: typeof Eye;
  prompt: string;
}

const GROUNDING_STEPS: GroundingStep[] = [
  { count: 5, sense: 'See', icon: Eye, prompt: 'Name 5 things you can see right now.' },
  { count: 4, sense: 'Touch', icon: Hand, prompt: 'Name 4 things you can feel or touch.' },
  { count: 3, sense: 'Hear', icon: Ear, prompt: 'Name 3 things you can hear.' },
  { count: 2, sense: 'Smell', icon: Wind, prompt: 'Name 2 things you can smell.' },
  { count: 1, sense: 'Taste', icon: Sun, prompt: 'Name 1 thing you can taste.' },
];

const MEDITATION_PROMPTS = [
  "Imagine each wave carrying away one worry.",
  "With each breath, feel yourself becoming lighter.",
  "The horizon is steady. You are steady.",
  "The sand holds you. The ground is here.",
  "This moment is enough. You are enough.",
];

export default function BeachScene() {
  const navigate = useNavigate();
  const { speak, voiceEnabled, isSpeaking } = useVoiceSettings();
  const { userProfile } = useSAI();
  const userName = userProfile?.nickname || 'Friend';
  
  const [currentMessage, setCurrentMessage] = useState("The waves are always here. So am I.");
  const [groundingStep, setGroundingStep] = useState<number | null>(null);
  const [showJournal, setShowJournal] = useState(false);
  const [journalEntry, setJournalEntry] = useState('');
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');

  // Speak message if voice enabled
  const sayMessage = useCallback(async (message: string) => {
    setCurrentMessage(message);
    if (voiceEnabled) {
      await speak(message);
    }
  }, [voiceEnabled, speak]);

  // 5-4-3-2-1 Grounding
  const startGrounding = useCallback(async () => {
    setGroundingStep(0);
    await sayMessage("Let's ground together using your senses. Take your time with each one.");
  }, [sayMessage]);

  const nextGroundingStep = useCallback(async () => {
    if (groundingStep === null) return;
    
    if (groundingStep < GROUNDING_STEPS.length - 1) {
      const nextStep = groundingStep + 1;
      setGroundingStep(nextStep);
      await sayMessage(GROUNDING_STEPS[nextStep].prompt);
    } else {
      setGroundingStep(null);
      await sayMessage("You did it. You're here, in this moment. Well done.");
    }
  }, [groundingStep, sayMessage]);

  // Wave Breathing
  const startBreathing = useCallback(async () => {
    setBreathPhase('inhale');
    await sayMessage("Breathe with the waves. In... hold... out...");
    
    // Breathing cycle
    const cycle = async () => {
      setBreathPhase('inhale');
      await new Promise(r => setTimeout(r, 4000));
      setBreathPhase('hold');
      await new Promise(r => setTimeout(r, 2000));
      setBreathPhase('exhale');
      await new Promise(r => setTimeout(r, 4000));
    };
    
    for (let i = 0; i < 3; i++) {
      await cycle();
    }
    
    setBreathPhase('idle');
    await sayMessage("Three breaths complete. How do you feel?");
  }, [sayMessage]);

  // Meditation
  const getMeditation = useCallback(async () => {
    const prompt = MEDITATION_PROMPTS[Math.floor(Math.random() * MEDITATION_PROMPTS.length)];
    await sayMessage(prompt);
  }, [sayMessage]);

  // Journal save to phone
  const saveJournal = useCallback(() => {
    if (!journalEntry.trim()) return;
    
    const date = new Date().toLocaleDateString();
    const content = `Journal Entry - ${date}\n\n${journalEntry}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    setJournalEntry('');
    setShowJournal(false);
    sayMessage("Your thoughts are saved. They're yours to keep.");
  }, [journalEntry, sayMessage]);

  return (
    <div 
      className="min-h-screen relative flex flex-col"
      style={{
        backgroundImage: `url(${oceanBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 via-transparent to-cyan-900/30" />
      
      {/* Header */}
      <header className="relative z-20 bg-card/30 backdrop-blur-sm border-b border-border/20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/sai-home')}
              className="text-foreground/70 hover:text-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Waves className="w-5 h-5 text-cyan-400" />
              <span className="font-display font-semibold text-foreground">Beach</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/sai-home')}
            className="text-foreground/70 hover:text-foreground"
          >
            <Home className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-end pb-8 p-4">
        <div className="max-w-lg mx-auto w-full flex flex-col items-center">
          
          {/* SAI */}
          <div className="mb-2">
            <FullBodySAI 
              size="lg" 
              state={isSpeaking ? 'speaking' : 'attentive'}
              showBreathing={breathPhase !== 'idle'}
            />
          </div>

          {/* Message */}
          <div className={cn(
            "bg-card/80 backdrop-blur-sm rounded-xl p-5 mb-4 border border-cyan-500/30 max-w-md w-full",
            "transition-all duration-300"
          )}>
            <p className="text-foreground text-lg leading-relaxed text-center">
              {currentMessage}
              {isSpeaking && <span className="animate-pulse ml-1">|</span>}
            </p>
            
            {/* Breathing indicator */}
            {breathPhase !== 'idle' && (
              <div className="mt-4 flex justify-center">
                <div className={cn(
                  "w-16 h-16 rounded-full border-2 border-cyan-400 flex items-center justify-center transition-all duration-1000",
                  breathPhase === 'inhale' && "scale-125 bg-cyan-400/20",
                  breathPhase === 'hold' && "scale-125 bg-cyan-400/30",
                  breathPhase === 'exhale' && "scale-75 bg-transparent"
                )}>
                  <span className="text-sm text-cyan-300 capitalize">{breathPhase}</span>
                </div>
              </div>
            )}
          </div>

          {/* Grounding Exercise UI */}
          {groundingStep !== null && (
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 mb-4 border border-cyan-500/30 max-w-md w-full">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {(() => {
                    const step = GROUNDING_STEPS[groundingStep];
                    const Icon = step.icon;
                    return (
                      <>
                        <Icon className="w-5 h-5 text-cyan-400" />
                        <span className="font-semibold text-foreground">
                          {step.count} things you {step.sense.toLowerCase()}
                        </span>
                      </>
                    );
                  })()}
                </div>
                <span className="text-muted-foreground text-sm">
                  {groundingStep + 1} of 5
                </span>
              </div>
              <p className="text-foreground/80 mb-4">{GROUNDING_STEPS[groundingStep].prompt}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGroundingStep(null)}
                >
                  Stop
                </Button>
                <Button
                  size="sm"
                  onClick={nextGroundingStep}
                  className="flex-1"
                >
                  {groundingStep < 4 ? 'Next' : 'Complete'}
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {groundingStep === null && breathPhase === 'idle' && (
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-4">
              <Button
                variant="outline"
                className="h-16 flex-col gap-1 bg-card/50 border-cyan-500/30 hover:bg-cyan-500/20"
                onClick={startGrounding}
              >
                <Eye className="w-5 h-5 text-cyan-400" />
                <span className="text-xs">5-4-3-2-1</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex-col gap-1 bg-card/50 border-cyan-500/30 hover:bg-cyan-500/20"
                onClick={startBreathing}
              >
                <Wind className="w-5 h-5 text-cyan-400" />
                <span className="text-xs">Breathe</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex-col gap-1 bg-card/50 border-cyan-500/30 hover:bg-cyan-500/20"
                onClick={() => setShowJournal(true)}
              >
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span className="text-xs">Journal</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex-col gap-1 bg-card/50 border-cyan-500/30 hover:bg-cyan-500/20"
                onClick={getMeditation}
              >
                <Sun className="w-5 h-5 text-cyan-400" />
                <span className="text-xs">Reflect</span>
              </Button>
            </div>
          )}

          <p className="text-foreground/40 text-xs text-center">
            The ocean doesn't judge. Neither do I.
          </p>
        </div>
      </main>

      {/* Journal Sheet */}
      <Sheet open={showJournal} onOpenChange={setShowJournal}>
        <SheetContent className="bg-card border-border">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Journal
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <p className="text-muted-foreground text-sm">
              Write whatever comes to mind. No one else will see this.
            </p>
            <Textarea
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[200px] bg-background/50"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowJournal(false)}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
              <Button
                onClick={saveJournal}
                disabled={!journalEntry.trim()}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Save to Phone
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}