import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { ArrowRight } from 'lucide-react';
import { SAIAnchoredLayout } from './SAIAnchoredLayout';

interface WHOIntroScreenProps {
  onContinue: () => void;
  onSkip?: () => void;
}

const INTRO_PHRASES = [
  "Before we continue, I want you to know something important.",
  "These questions aren't to label you. I see you, not diagnoses.",
  "Nothing you share is stored or judged. This just helps me understand what support fits you best.",
  "There's no right or wrong answers. Just honesty.",
];

export function WHOIntroScreen({ onContinue }: WHOIntroScreenProps) {
  const { captionsEnabled } = useAccessibility();
  const { speak, stopSpeaking, isSpeaking, voiceEnabled } = useVoiceSettings();
  const [hasHeardIntro, setHasHeardIntro] = useState(false);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  const playIntro = useCallback(async () => {
    if (!voiceEnabled) {
      setHasHeardIntro(true);
      return;
    }

    for (let i = 0; i < INTRO_PHRASES.length; i++) {
      setCurrentPhraseIndex(i);
      await speak(INTRO_PHRASES[i]);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setHasHeardIntro(true);
  }, [voiceEnabled, speak]);

  useEffect(() => {
    const timer = setTimeout(() => {
      playIntro();
    }, 800);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, []);

  const currentMessage = voiceEnabled && isSpeaking 
    ? INTRO_PHRASES[currentPhraseIndex]
    : INTRO_PHRASES.join(' ');

  return (
    <SAIAnchoredLayout 
      saiMessage={currentMessage}
      saiState={isSpeaking ? 'speaking' : 'attentive'}
      showOverlay={true}
      overlayStyle="glass"
    >
      <div className="flex-1 flex flex-col items-center justify-end pb-8">
        {/* Show all phrases as text when voice is off */}
        {!voiceEnabled && (
          <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-4 mb-6 max-w-sm">
            {INTRO_PHRASES.map((phrase, i) => (
              <p key={i} className="text-white/80 text-sm mb-2 last:mb-0">
                {phrase}
              </p>
            ))}
          </div>
        )}

        <Button
          onClick={onContinue}
          disabled={!hasHeardIntro && voiceEnabled}
          size="lg"
          className="w-full max-w-xs h-12 rounded-xl shadow-lg shadow-primary/30"
        >
          I'm Ready
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        
        <p className="text-white/40 text-xs text-center mt-3">
          {voiceEnabled && !hasHeardIntro ? "Listening..." : "Say 'ready' or tap the button"}
        </p>
      </div>
    </SAIAnchoredLayout>
  );
}
