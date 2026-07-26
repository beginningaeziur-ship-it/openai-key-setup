import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FullBodySAI } from '@/components/sai/FullBodySAI';
import { useSpeakThenListen } from '@/hooks/useSpeakThenListen';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Volume2, VolumeX, Mic } from 'lucide-react';
import comfortWaitingBg from '@/assets/comfort-waiting-bg.jpg';

/**
 * WaitingRoom - First screen where SAI appears
 *
 * SAI speaks intro messages with voice.
 * Mic ONLY activates after SAI finishes speaking and asks a question.
 *
 * Layout rules (accessibility):
 * - SAI sits on the floor plane of the room (bottom-left), never floating.
 * - SAI is a decorative background layer (z-0, aria-hidden, pointer-events-none).
 * - All interactive controls live in a z-10 column and always render ABOVE SAI.
 */

const INTRO_MESSAGES = [
  "Hello. I'm SAI — your Service AI companion.",
  "I'm here to walk alongside you, not ahead of you.",
  "I don't judge. I don't rush. I don't forget.",
  "My purpose is simple: to help you build a life that feels more like yours.",
  "Before we begin, I need to explain a few things about how I work and how we'll keep your information safe.",
  "Do you have any questions before we continue?"
];

export default function WaitingRoom() {
  const navigate = useNavigate();
  usePageTitle('SAI - Waiting Room');

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [showContinue, setShowContinue] = useState(false);

  const hasSpokenRef = useRef<Set<number>>(new Set());
  const isAdvancingRef = useRef(false);

  const handleContinueRef = useRef<() => void>(() => {});

  // Handle user voice responses
  const handleTranscript = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();

    if (lowerTranscript.includes('question') || lowerTranscript.includes('?') ||
        lowerTranscript.includes('what') || lowerTranscript.includes('how') ||
        lowerTranscript.includes('why')) {
      const response = "That's a great question. I'm here to support you through whatever you're facing. We'll take this one step at a time, and you can always ask me anything along the way. Ready to continue?";
      setDisplayedText(response);
      speakThenListen(response, true);
    } else if (lowerTranscript.includes('yes') || lowerTranscript.includes('ready') ||
               lowerTranscript.includes('continue') || lowerTranscript.includes('okay') ||
               lowerTranscript.includes('ok')) {
      handleContinueRef.current();
    } else if (lowerTranscript.includes('no') || lowerTranscript.includes('wait') ||
               lowerTranscript.includes('not sure')) {
      const response = "Take all the time you need. There's no rush here. Just let me know when you're ready.";
      setDisplayedText(response);
      speakThenListen(response, true);
    }
  }, []);

  const {
    isSpeaking,
    isWaitingForResponse,
    voiceEnabled,
    speakThenListen,
    speakOnly,
    stopSpeaking,
    setVoiceEnabled,
  } = useSpeakThenListen({
    listenDurationMs: 15000,
    onTranscript: handleTranscript,
  });

  // Speak current message
  const speakCurrentMessage = useCallback(async () => {
    if (isAdvancingRef.current) return;

    const message = INTRO_MESSAGES[currentMessageIndex];
    setDisplayedText(message);

    if (!hasSpokenRef.current.has(currentMessageIndex)) {
      hasSpokenRef.current.add(currentMessageIndex);

      if (currentMessageIndex === INTRO_MESSAGES.length - 1) {
        await speakThenListen(message, true);
        setShowContinue(true);
      } else {
        await speakOnly(message);
        isAdvancingRef.current = true;
        setTimeout(() => {
          setCurrentMessageIndex(prev => prev + 1);
          isAdvancingRef.current = false;
        }, 1500);
      }
    }
  }, [currentMessageIndex, speakThenListen, speakOnly]);

  useEffect(() => {
    speakCurrentMessage();
  }, [currentMessageIndex, speakCurrentMessage]);

  const handleContinue = useCallback(() => {
    stopSpeaking();
    navigate('/onboarding/security');
  }, [stopSpeaking, navigate]);

  handleContinueRef.current = handleContinue;

  const toggleVoice = () => {
    if (voiceEnabled) stopSpeaking();
    setVoiceEnabled(!voiceEnabled);
  };

  const saiState = isSpeaking ? 'speaking' : isWaitingForResponse ? 'listening' : 'attentive';

  return (
    <div
      className="relative min-h-dvh overflow-hidden"
      style={{
        backgroundImage: `url(${comfortWaitingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      {/* Floor plane — SAI stands on this, he never floats */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[38vh] bg-gradient-to-t from-black/70 via-black/35 to-transparent"
      />

      {/* Decorative SAI — background layer, offset to the left, paws on the floor line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 z-0 flex items-end sm:left-2"
      >
        <FullBodySAI
          size="lg"
          state={saiState}
          className="w-24 h-32 origin-bottom opacity-90 sm:w-40 sm:h-52 lg:w-56 lg:h-64"
        />
      </div>

      {/* Voice controls */}
      <div className="absolute right-3 top-3 z-20 flex gap-2 sm:right-6 sm:top-6">
        <button
          type="button"
          onClick={toggleVoice}
          aria-label={voiceEnabled ? "SAI's voice is on, tap to turn off" : "SAI's voice is off, tap to turn on"}
          aria-pressed={voiceEnabled}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full transition-all',
            'bg-black/60 backdrop-blur-md border border-white/20',
            'hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white',
            isSpeaking && 'ring-2 ring-primary/60'
          )}
        >
          {voiceEnabled ? (
            <Volume2 className={cn('h-6 w-6', isSpeaking ? 'text-primary' : 'text-white')} aria-hidden="true" />
          ) : (
            <VolumeX className="h-6 w-6 text-white" aria-hidden="true" />
          )}
        </button>

        {isWaitingForResponse && (
          <div
            role="status"
            aria-live="polite"
            aria-label="Microphone on, SAI is listening for your answer"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 backdrop-blur-md border border-primary"
          >
            <Mic className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
        )}
      </div>

      <main
        role="main"
        aria-label="SAI waiting room"
        className="relative z-10 flex min-h-dvh flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-16 sm:px-6 sm:pt-20"
      >
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-end">
          {isWaitingForResponse && (
            <p className="mb-2 text-center text-base text-white" role="status" aria-live="polite">
              SAI is listening…
            </p>
          )}

          <div
            className="rounded-2xl border border-white/20 bg-[#0A1628]/95 p-4 shadow-xl backdrop-blur-sm sm:p-5"
            role="status"
            aria-live="polite"
          >
            <h1 className="sr-only">SAI is introducing herself</h1>
            <p className="text-center text-base leading-relaxed text-white sm:text-lg">
              {displayedText}
            </p>
          </div>

          {/* Progress dots (decorative) */}
          <div className="mt-3 flex justify-center gap-2" aria-hidden="true">
            {INTRO_MESSAGES.map((_, index) => (
              <span
                key={index}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  index === currentMessageIndex
                    ? 'w-6 bg-primary'
                    : index < currentMessageIndex
                      ? 'w-2 bg-primary/60'
                      : 'w-2 bg-white/40'
                )}
              />
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            Step {currentMessageIndex + 1} of {INTRO_MESSAGES.length}
          </p>

          {/* Primary action — always above SAI, never covered */}
          <div className="relative z-20 mt-3 rounded-2xl border border-white/20 bg-[#0A1628]/95 p-3 backdrop-blur-sm">
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={!showContinue}
              aria-describedby={!showContinue ? 'next-help' : undefined}
              className="h-14 w-full rounded-xl text-lg font-semibold"
            >
              Next
            </Button>

            {!showContinue && (
              <p id="next-help" className="mt-2 text-center text-base text-[#B0BEC5]">
                Next unlocks when SAI is ready for you.
              </p>
            )}

            {!voiceEnabled && (
              <p className="mt-2 text-center text-base text-[#B0BEC5]">
                Voice is off. Use the speaker button to hear SAI.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
