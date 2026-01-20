import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FullBodySAI } from '@/components/sai/FullBodySAI';
import { Shield, Eye, Lock, UserCheck, Volume2, VolumeX, Mic } from 'lucide-react';
import { useSpeakThenListen } from '@/hooks/useSpeakThenListen';
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
    text: "There's also something called the Watcher app. It's a separate view that a trusted person can access if you choose to set it up.",
    icon: Eye,
  },
  {
    text: "The Watcher can see your general wellbeing status — never your private conversations or details. You control who, if anyone, has access.",
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
        lowerTranscript.includes('what') || lowerTranscript.includes('watcher') || 
        lowerTranscript.includes('explain')) {
      const response = "The Watcher is completely optional. It's just a way for someone you trust to check on your general wellbeing — they never see your private conversations. You're always in control.";
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
      className="min-h-screen relative flex items-center justify-center"
      style={{
        backgroundImage: `url(${comfortOfficeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Voice/Mic controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
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
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 px-6 max-w-5xl mx-auto">
        {/* SAI on left */}
        <div className="flex-shrink-0">
          <FullBodySAI 
            size="lg" 
            state={saiState} 
          />
          
          {/* Listening indicator */}
          {isWaitingForResponse && (
            <div className="flex items-center justify-center gap-2 text-primary animate-pulse mt-4">
              <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
              <span className="text-sm">SAI is listening...</span>
            </div>
          )}
        </div>

        {/* Desk area on right */}
        <div className="flex-1 max-w-xl">
          {/* Speech bubble with icon */}
          <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-border/50">
            {CurrentIcon && (
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <CurrentIcon className="w-6 h-6 text-primary" />
                </div>
              </div>
            )}
            
            <p className="text-lg text-foreground leading-relaxed text-center min-h-[80px]">
              {displayedText}
              {isSpeaking && <span className="animate-pulse ml-1">|</span>}
            </p>
          </div>

          {/* Progress */}
          <div className="flex justify-center gap-2 mt-6">
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
          
          {showContinue && (
            <div className="flex justify-center mt-6">
              <Button 
                size="lg"
                onClick={handleContinue}
                className="animate-fade-in"
              >
                Continue to Assessment
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
