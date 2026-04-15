import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FullBodySAI } from '@/components/sai/FullBodySAI';
import { useSpeakThenListen } from '@/hooks/useSpeakThenListen';
import { Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import comfortWaitingBg from '@/assets/comfort-waiting-bg.jpg';

/**
 * WaitingRoom - First screen where SAI appears
 * 
 * SAI speaks intro messages with voice
 * Mic ONLY activates after SAI finishes speaking and asks a question
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
  
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [showContinue, setShowContinue] = useState(false);
  const [saiResponse, setSaiResponse] = useState<string | null>(null);
  
  const hasSpokenRef = useRef<Set<number>>(new Set());
  const isAdvancingRef = useRef(false);

  // Handle user voice responses
  const handleTranscript = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    // Check for questions or concerns
    if (lowerTranscript.includes('question') || lowerTranscript.includes('?') || 
        lowerTranscript.includes('what') || lowerTranscript.includes('how') || 
        lowerTranscript.includes('why')) {
      const response = "That's a great question. I'm here to support you through whatever you're facing. We'll take this one step at a time, and you can always ask me anything along the way. Ready to continue?";
      setSaiResponse(response);
      setDisplayedText(response);
      speakThenListen(response, true);
    } else if (lowerTranscript.includes('yes') || lowerTranscript.includes('ready') || 
               lowerTranscript.includes('continue') || lowerTranscript.includes('okay') || 
               lowerTranscript.includes('ok')) {
      handleContinue();
    } else if (lowerTranscript.includes('no') || lowerTranscript.includes('wait') || 
               lowerTranscript.includes('not sure')) {
      const response = "Take all the time you need. There's no rush here. Just let me know when you're ready.";
      setSaiResponse(response);
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
    
    // Only speak if we haven't spoken this message yet
    if (!hasSpokenRef.current.has(currentMessageIndex)) {
      hasSpokenRef.current.add(currentMessageIndex);
      
      // Last message - speak then listen for response
      if (currentMessageIndex === INTRO_MESSAGES.length - 1) {
        await speakThenListen(message, true);
        setShowContinue(true);
      } else {
        // Not last message - speak only, then auto-advance
        await speakOnly(message);
        
        // Auto-advance after speaking
        isAdvancingRef.current = true;
        setTimeout(() => {
          setCurrentMessageIndex(prev => prev + 1);
          isAdvancingRef.current = false;
        }, 1500);
      }
    }
  }, [currentMessageIndex, speakThenListen, speakOnly]);

  // Speak message when index changes
  useEffect(() => {
    speakCurrentMessage();
  }, [currentMessageIndex, speakCurrentMessage]);

  const handleContinue = () => {
    stopSpeaking();
    navigate('/onboarding/security');
  };

  const toggleVoice = () => {
    if (voiceEnabled) stopSpeaking();
    setVoiceEnabled(!voiceEnabled);
  };

  const saiState = isSpeaking ? 'speaking' : isWaitingForResponse ? 'listening' : 'attentive';

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        backgroundImage: `url(${comfortWaitingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute right-4 top-4 z-20 flex gap-2 sm:right-6 sm:top-6">
        <button
          onClick={toggleVoice}
          className={cn(
            "p-2.5 rounded-full transition-all",
            "bg-black/40 backdrop-blur-md border border-white/10",
            "hover:bg-black/60",
            isSpeaking && "ring-2 ring-primary/50"
          )}
        >
          {voiceEnabled ? (
            <Volume2 className={cn("w-5 h-5", isSpeaking ? "text-primary animate-pulse" : "text-white/80")} />
          ) : (
            <VolumeX className="w-5 h-5 text-white/50" />
          )}
        </button>

        {isWaitingForResponse && (
          <div className={cn(
            "p-2.5 rounded-full",
            "bg-primary/80 backdrop-blur-md border border-primary/30",
            "animate-pulse"
          )}>
            <Mic className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      <div className="relative z-10 flex min-h-screen flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-20 sm:px-6 sm:pt-24">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-end">
          <div className="space-y-4">
            {isWaitingForResponse && (
              <div className="flex items-center justify-center gap-2 text-primary animate-pulse">
                <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
                <span className="text-sm">SAI is listening...</span>
              </div>
            )}

            <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-border/50 min-h-[104px] flex items-center justify-center sm:min-h-[120px] sm:p-6">
              <p className="text-base text-center text-foreground leading-relaxed sm:text-lg md:text-xl">
                {displayedText}
                {isSpeaking && <span className="animate-pulse ml-1">|</span>}
              </p>
            </div>

            <div className="flex justify-center gap-2">
              {INTRO_MESSAGES.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentMessageIndex
                      ? "bg-primary w-6"
                      : index < currentMessageIndex
                        ? "bg-primary/60"
                        : "bg-muted"
                  )}
                />
              ))}
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/80 p-3 backdrop-blur-sm">
              <Button
                size="lg"
                onClick={handleContinue}
                disabled={!showContinue}
                className={cn(
                  "h-12 w-full rounded-xl text-base sm:h-14 sm:text-lg",
                  showContinue && "animate-fade-in"
                )}
              >
                Next
              </Button>

              {!showContinue && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Next unlocks here when SAI is ready for you.
                </p>
              )}

              {!voiceEnabled && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Voice is off. Tap the speaker icon if you want to hear SAI.
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex min-h-[180px] items-end justify-center sm:min-h-[220px]">
            <FullBodySAI
              size="lg"
              state={saiState}
              className="origin-bottom translate-y-2 scale-95 sm:translate-y-4 sm:scale-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
