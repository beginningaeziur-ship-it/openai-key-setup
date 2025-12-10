// Wall Art Panel - Emotions & Thoughts (CBT tools, journaling)
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { Frame, PenLine, RefreshCw, Lightbulb, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WallArtPanelProps {
  open: boolean;
  onClose: () => void;
  userName?: string;
}

const journalPrompts = [
  "What's one small thing that went okay today?",
  "What am I feeling right now, without judgment?",
  "What would I tell a friend who felt this way?",
  "What do I need most right now?",
  "What's one thing I can control today?",
];

const reframes = [
  { thought: "I'm a failure", reframe: "I'm learning. Failing is part of growing." },
  { thought: "Nobody cares", reframe: "Some people do. I might not see it right now." },
  { thought: "I can't do this", reframe: "I'm struggling, but I've gotten through hard things before." },
  { thought: "Everything is my fault", reframe: "Some things are my responsibility. Not everything." },
  { thought: "I should be better by now", reframe: "Healing isn't linear. I'm where I am." },
];

export function WallArtPanel({ open, onClose, userName = 'Friend' }: WallArtPanelProps) {
  const { speak, voiceEnabled, isSpeaking } = useVoiceSettings();
  const [journalEntry, setJournalEntry] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState(journalPrompts[0]);
  const [showReframes, setShowReframes] = useState(false);

  const getNewPrompt = () => {
    const currentIndex = journalPrompts.indexOf(currentPrompt);
    const nextIndex = (currentIndex + 1) % journalPrompts.length;
    setCurrentPrompt(journalPrompts[nextIndex]);
    if (voiceEnabled) {
      speak(journalPrompts[nextIndex]);
    }
  };

  const speakReframe = (reframe: typeof reframes[0]) => {
    if (voiceEnabled) {
      speak(`When you think: "${reframe.thought}"... try this instead: "${reframe.reframe}"`);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Frame className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <SheetTitle>Emotions & Thoughts</SheetTitle>
              <SheetDescription>
                Journaling, reframes, and gentle reflection
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Toggle between journaling and reframes */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={!showReframes ? "default" : "outline"}
            size="sm"
            onClick={() => setShowReframes(false)}
            className="flex-1"
          >
            <PenLine className="w-4 h-4 mr-1" />
            Journal
          </Button>
          <Button
            variant={showReframes ? "default" : "outline"}
            size="sm"
            onClick={() => setShowReframes(true)}
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Reframes
          </Button>
        </div>

        {!showReframes ? (
          /* Journaling section */
          <div className="space-y-4">
            <Card className="border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium">Prompt</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={getNewPrompt}>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    New
                  </Button>
                </div>
                <p className="text-foreground/80 italic">"{currentPrompt}"</p>
              </CardContent>
            </Card>

            <Textarea
              placeholder="Write here... no one else sees this."
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              className="min-h-[150px] resize-none"
            />

            <p className="text-xs text-muted-foreground text-center">
              Your words stay here. Private. Just for you.
            </p>
          </div>
        ) : (
          /* Reframes section */
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              When thoughts feel heavy, try shifting them gently.
            </p>
            
            {reframes.map((reframe, index) => (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={() => speakReframe(reframe)}
              >
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">When you think:</p>
                  <p className="font-medium text-foreground mb-2">"{reframe.thought}"</p>
                  <p className="text-sm text-muted-foreground mb-1">Try:</p>
                  <p className="text-primary">"{reframe.reframe}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick comfort */}
        <div className="mt-8 pt-6 border-t">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => speak("Your feelings are valid. You don't have to fix them. Just notice them.")}
          >
            <Heart className="w-4 h-4 mr-1" />
            Gentle Reminder
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
