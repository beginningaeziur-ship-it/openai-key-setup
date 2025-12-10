// Nightstand Panel - Today's Check-In
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { Lamp, Heart, Shield, Frown, Meh, Smile, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NightstandPanelProps {
  open: boolean;
  onClose: () => void;
  userName?: string;
}

const moodOptions = [
  { id: 'struggling', label: 'Struggling', icon: Frown, color: 'text-rose-400' },
  { id: 'okay', label: 'Okay', icon: Meh, color: 'text-amber-400' },
  { id: 'good', label: 'Good', icon: Smile, color: 'text-emerald-400' },
];

const safetyLevels = [
  { id: 'safe', label: "I'm safe", color: 'bg-emerald-500/20 border-emerald-500/40' },
  { id: 'unsure', label: "I'm not sure", color: 'bg-amber-500/20 border-amber-500/40' },
  { id: 'unsafe', label: "I don't feel safe", color: 'bg-rose-500/20 border-rose-500/40' },
];

export function NightstandPanel({ open, onClose, userName = 'Friend' }: NightstandPanelProps) {
  const { speak, voiceEnabled } = useVoiceSettings();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedSafety, setSelectedSafety] = useState<string | null>(null);
  const [checkInComplete, setCheckInComplete] = useState(false);

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    if (voiceEnabled) {
      if (moodId === 'struggling') {
        speak("Thank you for being honest with me. I'm here.");
      } else if (moodId === 'okay') {
        speak("Okay is okay. We work with where you are.");
      } else {
        speak("I'm glad. Let's keep that going.");
      }
    }
  };

  const handleSafetySelect = (safetyId: string) => {
    setSelectedSafety(safetyId);
    if (voiceEnabled) {
      if (safetyId === 'unsafe') {
        speak("I hear you. Let's figure out what you need right now. You're not alone.");
      } else if (safetyId === 'unsure') {
        speak("That's okay. We can work through this together.");
      }
    }
  };

  const completeCheckIn = () => {
    setCheckInComplete(true);
    if (voiceEnabled) {
      speak(`Thank you for checking in, ${userName}. I see you. I'm here.`);
    }
  };

  if (checkInComplete) {
    return (
      <Sheet open={open} onOpenChange={() => { onClose(); setCheckInComplete(false); }}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Check-In Complete</h2>
            <p className="text-muted-foreground mb-6">
              I see you, {userName}. I'm here whenever you need me.
            </p>
            <Button onClick={() => { onClose(); setCheckInComplete(false); }}>
              Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-teal-500/20">
              <Lamp className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <SheetTitle>Today's Check-In</SheetTitle>
              <SheetDescription>
                How are you really doing right now?
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Mood check */}
        <div className="mb-8">
          <h3 className="text-sm font-medium mb-3">How are you feeling?</h3>
          <div className="grid grid-cols-3 gap-3">
            {moodOptions.map((mood) => {
              const Icon = mood.icon;
              const isSelected = selectedMood === mood.id;
              
              return (
                <Card
                  key={mood.id}
                  className={cn(
                    'cursor-pointer transition-all text-center p-4',
                    isSelected ? 'border-primary bg-primary/10' : 'border-border/50 hover:border-border'
                  )}
                  onClick={() => handleMoodSelect(mood.id)}
                >
                  <Icon className={cn('w-8 h-8 mx-auto mb-2', mood.color)} />
                  <p className="text-sm font-medium">{mood.label}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Safety check */}
        <div className="mb-8">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Safety check
          </h3>
          <div className="space-y-2">
            {safetyLevels.map((level) => {
              const isSelected = selectedSafety === level.id;
              
              return (
                <Card
                  key={level.id}
                  className={cn(
                    'cursor-pointer transition-all p-4 border-2',
                    isSelected ? level.color : 'border-border/50 hover:border-border'
                  )}
                  onClick={() => handleSafetySelect(level.id)}
                >
                  <p className="font-medium">{level.label}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <Button
          onClick={completeCheckIn}
          className="w-full"
          disabled={!selectedMood || !selectedSafety}
        >
          Complete Check-In
        </Button>

        {/* Safety notice */}
        {selectedSafety === 'unsafe' && (
          <Card className="mt-6 border-rose-500/50 bg-rose-500/10">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5" />
              <div>
                <p className="font-medium text-rose-400">I'm here with you</p>
                <p className="text-sm text-muted-foreground">
                  If you're in immediate danger, please reach out to emergency services or a crisis line.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </SheetContent>
    </Sheet>
  );
}
