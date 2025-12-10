// Rug Panel - Breathing, Orientation, Dissociation Tools
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { Footprints, Wind, Eye, Anchor, Timer, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RugPanelProps {
  open: boolean;
  onClose: () => void;
  userName?: string;
}

const orientationTools = [
  {
    id: 'present',
    title: 'Present Moment',
    icon: Anchor,
    steps: [
      "Where are you right now? Name the room.",
      "What day is it today?",
      "What time is it, roughly?",
      "Name one thing you can see in front of you.",
      "You are here. You are now. You are safe."
    ],
  },
  {
    id: 'body-scan',
    title: 'Body Scan',
    icon: Target,
    steps: [
      "Feel your feet on the floor. Push down gently.",
      "Notice your hands. Where are they resting?",
      "Feel your back against the chair or surface.",
      "Relax your shoulders. Let them drop.",
      "Unclench your jaw. Breathe."
    ],
  },
];

const breathingPatterns = [
  { id: 'box', name: '4-4-4-4 Box', inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  { id: 'calm', name: '4-7-8 Calm', inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  { id: 'simple', name: '3-3 Simple', inhale: 3, hold1: 0, exhale: 3, hold2: 0 },
];

const dissociationTools = [
  {
    id: 'ice',
    title: 'Ice Cube Technique',
    description: 'Hold something cold to bring you back to your body',
    script: 'Find something cold - ice, frozen vegetables, cold water. Hold it in your hands. Focus on the sensation. The cold is real. You are real. You are here.',
  },
  {
    id: 'texture',
    title: 'Texture Touch',
    description: 'Feel different textures around you',
    script: 'Touch 5 different textures around you. Notice if they are rough or smooth, soft or hard, warm or cool. Describe each one to yourself. You are connected to the physical world.',
  },
  {
    id: 'name-it',
    title: 'Name What You See',
    description: 'Rapid naming to ground yourself',
    script: 'Look around and name everything you see. Just names, no descriptions. Chair. Wall. Light. Window. Door. Keep going until you feel more present.',
  },
];

export function RugPanel({ open, onClose, userName = 'Friend' }: RugPanelProps) {
  const { speak, voiceEnabled } = useVoiceSettings();
  const [activeBreathing, setActiveBreathing] = useState<string | null>(null);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [countdown, setCountdown] = useState(0);

  const handleOrientation = async (tool: typeof orientationTools[0]) => {
    if (voiceEnabled) {
      for (const step of tool.steps) {
        await speak(step);
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  };

  const startBreathing = (pattern: typeof breathingPatterns[0]) => {
    setActiveBreathing(pattern.id);
    runBreathCycle(pattern);
  };

  const runBreathCycle = async (pattern: typeof breathingPatterns[0]) => {
    type BreathPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';
    const allPhases: Array<{ phase: BreathPhase; duration: number; message: string }> = [
      { phase: 'inhale', duration: pattern.inhale, message: 'Breathe in' },
      { phase: 'hold1', duration: pattern.hold1, message: 'Hold' },
      { phase: 'exhale', duration: pattern.exhale, message: 'Breathe out' },
      { phase: 'hold2', duration: pattern.hold2, message: 'Hold' },
    ];
    const phases = allPhases.filter(p => p.duration > 0);

    for (let cycle = 0; cycle < 3; cycle++) {
      for (const p of phases) {
        setBreathPhase(p.phase);
        if (voiceEnabled && cycle === 0) {
          speak(p.message);
        }
        for (let i = p.duration; i > 0; i--) {
          setCountdown(i);
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }
    
    if (voiceEnabled) {
      speak('Well done. Take a moment.');
    }
    setActiveBreathing(null);
  };

  const handleDissociation = async (tool: typeof dissociationTools[0]) => {
    if (voiceEnabled) {
      await speak(tool.script);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-500/20">
              <Footprints className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <SheetTitle>Grounding Tools</SheetTitle>
              <SheetDescription>
                Breathing, orientation, and presence exercises
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-8">
          {/* Breathing Section */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Wind className="w-4 h-4" />
              Breathing Patterns
            </h3>
            
            {activeBreathing ? (
              <Card className="border-primary bg-primary/5">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {countdown}
                  </div>
                  <div className="text-lg font-medium capitalize">
                    {breathPhase === 'hold1' || breathPhase === 'hold2' ? 'Hold' : breathPhase}
                  </div>
                  <div className={cn(
                    'w-16 h-16 mx-auto mt-4 rounded-full transition-all duration-1000',
                    breathPhase === 'inhale' && 'scale-125 bg-primary/30',
                    breathPhase === 'exhale' && 'scale-75 bg-primary/20',
                    (breathPhase === 'hold1' || breathPhase === 'hold2') && 'scale-100 bg-primary/25'
                  )} />
                  <Button 
                    variant="ghost" 
                    className="mt-4"
                    onClick={() => setActiveBreathing(null)}
                  >
                    Stop
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {breathingPatterns.map((pattern) => (
                  <Button
                    key={pattern.id}
                    variant="outline"
                    className="h-auto py-3 flex-col"
                    onClick={() => startBreathing(pattern)}
                  >
                    <Timer className="w-4 h-4 mb-1" />
                    <span className="text-xs">{pattern.name}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Orientation Section */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Orientation
            </h3>
            <div className="space-y-2">
              {orientationTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Button
                    key={tool.id}
                    variant="outline"
                    className="w-full justify-start h-auto py-3"
                    onClick={() => handleOrientation(tool)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span>{tool.title}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Dissociation Section */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Anchor className="w-4 h-4" />
              Coming Back to Your Body
            </h3>
            <div className="space-y-2">
              {dissociationTools.map((tool) => (
                <Card 
                  key={tool.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleDissociation(tool)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-medium">{tool.title}</h4>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
