import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FullBodySAI } from '@/components/sai/FullBodySAI';
import { DoorOpen, Shield, Eye, Lock, Volume2, VolumeX, Mic } from 'lucide-react';
import { useSpeakThenListen } from '@/hooks/useSpeakThenListen';
import { PROFESSIONAL_APP_LANGUAGE } from '@/lib/traumaInformedLogic';
import comfortOfficeBg from '@/assets/comfort-office-bg.jpg';

/**
 * OfficeExit - Full-bodied SAI with exit door
 * 
 * SAI recaps security, reminds of everything discussed with VOICE
 * Microphone activates when SAI asks if ready
 */

const EXIT_MESSAGES = [
  "We've covered a lot today. Let me remind you of what we discussed.",
  "Your information stays private. Nothing is permanently stored from our conversation.",
  `If you set up the ${PROFESSIONAL_APP_LANGUAGE.name}, your care team will only see your general stability — never your private details.`,
  "Your safety code will protect your space. Only you decide who enters.",
  "Now, let's head to your new safe home. I'll meet you there.",
  "Ready to go?"
];

const MESSAGE_ICONS = [
  null,
  Shield,
  Eye,
  Lock,
  null,
  DoorOpen,
];

export default function OfficeExit() {
  const navigate = useNavigate();
  
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [showContinue, setShowContinue] = useState(false);
  
  const hasSpokenRef = useRef<Set<number>>(new Set());
  const isAdvancingRef = useRef(false);

  // Handle user voice responses
  const handleTranscript = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    if (lowerTranscript.includes('yes') || lowerTranscript.includes('ready') || 
        lowerTranscript.includes('go') || lowerTranscript.includes('let\'s')) {
      handleExit();
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
    
    const message = EXIT_MESSAGES[currentMessageIndex];
    setDisplayedText(message);
    
    if (!hasSpokenRef.current.has(currentMessageIndex)) {
      hasSpokenRef.current.add(currentMessageIndex);
      
      // Last message - speak then listen for response
      if (currentMessageIndex === EXIT_MESSAGES.length - 1) {
        await speakThenListen(message, true);
        setShowContinue(true);
      } else {
        // Not last message - speak only, then auto-advance
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

  const handleExit = () => {
    stopSpeaking();
    navigate('/onboarding/play-room');
  };

  const toggleVoice = () => {
    if (voiceEnabled) stopSpeaking();
    setVoiceEnabled(!voiceEnabled);
  };

  const CurrentIcon = MESSAGE_ICONS[currentMessageIndex];
  const saiState = isSpeaking ? 'speaking' : isWaitingForResponse ? 'listening' : 'attentive';

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        backgroundImage: `url(${comfortOfficeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="absolute right-4 top-4 z-20 flex gap-2 sm:right-6 sm:top-6">
        <button
          onClick={toggleVoice}
          className={cn(
            "p-2 rounded-full transition-all",
            "bg-black/40 backdrop-blur-md border border-white/10",
            "hover:bg-black/60",
            isSpeaking && "ring-2 ring-primary/50"
          )}
        >
          {voiceEnabled ? (
            <Volume2 className={cn("w-4 h-4 sm:w-5 sm:h-5", isSpeaking ? "text-primary animate-pulse" : "text-white/80")} />
          ) : (
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-white/50" />
          )}
        </button>

        {isWaitingForResponse && (
          <div className={cn(
            "p-2 rounded-full",
            "bg-primary/80 backdrop-blur-md border border-primary/30",
            "animate-pulse"
          )}>
            <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        )}
      </div>

      <div className="relative z-10 flex h-screen flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-14 sm:px-6 sm:pt-20">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-end gap-2 min-h-0 lg:flex-row lg:items-end lg:gap-6">
          <div className="order-1 flex-1 max-w-xl lg:order-2 lg:max-w-none">
            <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-border/50 sm:p-5">
              {CurrentIcon && (
                <div className="flex justify-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center sm:w-12 sm:h-12">
                    <CurrentIcon className="w-5 h-5 text-primary sm:w-6 sm:h-6" />
                  </div>
                </div>
              )}

              <p className="text-sm text-center text-foreground leading-relaxed sm:text-base sm:min-h-[60px]">
                {displayedText}
                {isSpeaking && <span className="animate-pulse ml-1">|</span>}
              </p>
            </div>

            <div className="mt-2 flex justify-center gap-2">
              {EXIT_MESSAGES.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300 sm:w-2 sm:h-2",
                    index === currentMessageIndex
                      ? "bg-primary w-4 sm:w-6"
                      : index < currentMessageIndex
                        ? "bg-primary/60"
                        : "bg-muted"
                  )}
                />
              ))}
            </div>

            <div className="mt-2 rounded-2xl border border-border/50 bg-card/80 p-2.5 backdrop-blur-sm sm:p-3">
              <Button
                size="lg"
                onClick={handleExit}
                disabled={!showContinue}
                className={cn(
                  "h-11 w-full rounded-xl text-sm sm:h-12 sm:text-base",
                  showContinue && "animate-fade-in"
                )}
              >
                Next
              </Button>

              {!showContinue && (
                <p className="mt-1.5 text-center text-xs text-muted-foreground">
                  Next unlocks here when SAI is ready for you.
                </p>
              )}
            </div>
          </div>

          <div className="order-2 flex h-[140px] flex-shrink-0 items-end justify-center lg:order-1 lg:min-h-[340px]">
            <div className="flex flex-col items-center">
              <FullBodySAI
                size="xl"
                state={saiState}
                className="w-36 h-44 sm:w-64 sm:h-72 origin-bottom translate-y-1 lg:translate-y-0"
              />

              {isWaitingForResponse && (
                <div className="mt-2 flex items-center justify-center gap-2 text-primary animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span className="text-xs">SAI is listening...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
