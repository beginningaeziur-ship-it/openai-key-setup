import { useState, useEffect, useCallback } from 'react';
import { PaperTestForm } from './PaperTestForm';
import { Button } from '@/components/ui/button';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { Volume2, VolumeX, ArrowRight } from 'lucide-react';

interface WHOIntroScreenProps {
  onContinue: () => void;
  onSkip?: () => void;
}

const INTRO_SCRIPT = `Hello. Before we get started, I want you to know something important.

These questions I'm about to ask are not to label you. I don't see diagnoses or conditions. I see you.

Nothing you share here is stored or judged. These questions simply help me understand what kind of support might be most helpful for you.

I want to set goals that actually fit your life, not someone else's idea of what you need.

There's no right or wrong answers. Just honesty.

Ready to begin?`;

export function WHOIntroScreen({ onContinue, onSkip }: WHOIntroScreenProps) {
  const { captionsEnabled } = useAccessibility();
  const { speak, stopSpeaking, isSpeaking, voiceEnabled } = useVoiceSettings();
  const [hasHeardIntro, setHasHeardIntro] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState('');

  // Split script into phrases for caption display
  const phrases = INTRO_SCRIPT.split('\n\n');

  const playIntro = useCallback(async () => {
    if (!voiceEnabled) {
      setShowCaptions(true);
      setHasHeardIntro(true);
      return;
    }

    setShowCaptions(captionsEnabled);
    
    for (let i = 0; i < phrases.length; i++) {
      setCurrentPhrase(phrases[i]);
      await speak(phrases[i]);
      // Small pause between phrases
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setHasHeardIntro(true);
  }, [voiceEnabled, captionsEnabled, speak, phrases]);

  useEffect(() => {
    // Auto-play intro on mount
    const timer = setTimeout(() => {
      playIntro();
    }, 500);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, []);

  const handleMuteToggle = () => {
    if (isSpeaking) {
      stopSpeaking();
      setShowCaptions(true);
      setHasHeardIntro(true);
    }
  };

  // If voice is disabled, show text immediately
  const shouldShowAllText = !voiceEnabled || showCaptions;

  return (
    <PaperTestForm>
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-stone-300 pb-4">
        <h1 className="text-2xl md:text-3xl font-serif text-stone-800 font-bold tracking-tight">
          Personal Support Assessment
        </h1>
        <p className="text-stone-500 text-sm mt-1 font-mono uppercase tracking-widest">
          Confidential
        </p>
      </div>

      {/* SAI speaking indicator */}
      {isSpeaking && (
        <div className="flex items-center justify-center gap-3 py-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1 bg-primary rounded-full animate-pulse"
                style={{
                  height: `${12 + Math.random() * 12}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
          <span className="text-stone-600 text-sm italic">SAI is speaking...</span>
          <button 
            onClick={handleMuteToggle}
            className="p-2 rounded-full hover:bg-stone-200 transition-colors"
            aria-label="Stop speaking"
          >
            <VolumeX className="w-4 h-4 text-stone-500" />
          </button>
        </div>
      )}

      {/* Captions / Text content */}
      {shouldShowAllText ? (
        <div className="space-y-4 text-stone-700 leading-relaxed font-serif text-lg">
          {phrases.map((phrase, i) => (
            <p 
              key={i}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {phrase}
            </p>
          ))}
        </div>
      ) : captionsEnabled && currentPhrase ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <p className="text-stone-700 text-xl font-serif text-center leading-relaxed animate-fade-in">
            "{currentPhrase}"
          </p>
        </div>
      ) : (
        <div className="min-h-[200px] flex items-center justify-center">
          <p className="text-stone-400 text-sm italic">Listening to SAI...</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-8 pt-6 border-t-2 border-stone-300 space-y-3">
        <Button
          onClick={onContinue}
          disabled={!hasHeardIntro && voiceEnabled}
          className="w-full h-12 text-lg font-serif bg-stone-800 hover:bg-stone-700 disabled:opacity-50"
        >
          I'm Ready
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        
        {!voiceEnabled && (
          <p className="text-center text-stone-500 text-xs">
            Voice is disabled. You can read the information above.
          </p>
        )}
      </div>
    </PaperTestForm>
  );
}
