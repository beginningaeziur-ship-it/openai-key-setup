import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FullBodySAI } from '@/components/sai/FullBodySAI';
import { Shield, Eye, Lock, UserCheck, Volume2, VolumeX, Mic } from 'lucide-react';
import { useSpeakThenListen } from '@/hooks/useSpeakThenListen';
import { PROFESSIONAL_APP_LANGUAGE, getProfessionalAppExplanation } from '@/lib/traumaInformedLogic';
import comfortOfficeBg from '@/assets/comfort-office-bg.jpg';

/**
 * SecurityBriefing - Office with desk
 * 
 * SAI explains security with VOICE
 * Microphone ONLY activates after SAI asks final question
 */

const SECURITY_MESSAGES = [
  {
    text: "Before we go further, I want you to understand how your privacy works here.",
    icon: null,
  },
  {
    text: "Nothing you share with me is stored permanently. Your answers help me understand your path — but they stay in this session only.",
    icon: Shield,
  },
  {
    text: `There's also something called the ${PROFESSIONAL_APP_LANGUAGE.name}. It's a separate view that your care team can access if you choose to set it up.`,
    icon: Eye,
  },
  {
    text: `The ${PROFESSIONAL_APP_LANGUAGE.name} shows only your general stability and progress — never your private conversations or details. ${PROFESSIONAL_APP_LANGUAGE.controlNote}`,
    icon: UserCheck,
  },
  {
    text: "Your safety code protects everything. No one enters without your permission.",
    icon: Lock,
  },
  {
    text: "Does this all make sense? Any questions before we continue?",
    icon: null,
  },
];

export default function SecurityBriefing() {
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
    
    if (lowerTranscript.includes('question') || lowerTranscript.includes('?') || 
        lowerTranscript.includes('what') || lowerTranscript.includes('professional') || 
        lowerTranscript.includes('explain') || lowerTranscript.includes('care team')) {
      const response = getProfessionalAppExplanation();
      setSaiResponse(response);
      setDisplayedText(response);
      speakThenListen(response, true);
    } else if (lowerTranscript.includes('yes') || lowerTranscript.includes('understand') || 
               lowerTranscript.includes('makes sense') || lowerTranscript.includes('okay') || 
               lowerTranscript.includes('continue')) {
      handleContinue();
    } else if (lowerTranscript.includes('no') || lowerTranscript.includes('confused')) {
      const response = "That's okay, I can explain more. Your privacy is my top priority. Nothing leaves this space without your permission. Would you like to continue when you're ready?";
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
    
    const message = SECURITY_MESSAGES[currentMessageIndex];
    setDisplayedText(message.text);
    
    if (!hasSpokenRef.current.has(currentMessageIndex)) {
      hasSpokenRef.current.add(currentMessageIndex);
      
      // Last message - speak then listen for response
      if (currentMessageIndex === SECURITY_MESSAGES.length - 1) {
        await speakThenListen(message.text, true);
        setShowContinue(true);
      } else {
        // Not last message - speak only, then auto-advance
        await speakOnly(message.text);
        
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

  const handleContinue = () => {
    stopSpeaking();
    navigate('/onboarding/assessment');
  };

  const toggleVoice = () => {
    if (voiceEnabled) stopSpeaking();
    setVoiceEnabled(!voiceEnabled);
  };

  const CurrentIcon = SECURITY_MESSAGES[currentMessageIndex]?.icon;
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
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-end gap-4 lg:flex-row lg:items-end lg:gap-8">
          <div className="order-1 flex-1 max-w-xl lg:order-2 lg:max-w-none">
            <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-border/50 sm:p-6">
              {CurrentIcon && (
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <CurrentIcon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              )}

              <p className="text-base text-center text-foreground leading-relaxed min-h-[80px] sm:text-lg">
                {displayedText}
                {isSpeaking && <span className="animate-pulse ml-1">|</span>}
              </p>
            </div>

            <div className="mt-4 flex justify-center gap-2">
              {SECURITY_MESSAGES.map((_, index) => (
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

            <div className="mt-4 rounded-2xl border border-border/50 bg-card/80 p-3 backdrop-blur-sm">
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
            </div>
          </div>

          <div className="order-2 flex min-h-[180px] flex-shrink-0 items-end justify-center lg:order-1 lg:min-h-[320px]">
            <div className="flex flex-col items-center">
              <FullBodySAI
                size="lg"
                state={saiState}
                className="origin-bottom translate-y-2 scale-95 sm:translate-y-4 sm:scale-100"
              />

              {isWaitingForResponse && (
                <div className="mt-4 flex items-center justify-center gap-2 text-primary animate-pulse">
                  <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
                  <span className="text-sm">SAI is listening...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
