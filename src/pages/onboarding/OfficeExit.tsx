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
      className="min-h-screen relative flex items-center justify-center"
      style={{
        backgroundImage: `url(${comfortOfficeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 px-6 max-w-5xl mx-auto">
        {/* SAI on left */}
        <div className="flex-shrink-0">
          <FullBodySAI 
            size="xl" 
            state={saiState} 
          />
          
          {isWaitingForResponse && (
            <div className="flex items-center justify-center gap-2 text-primary animate-pulse mt-4">
              <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
              <span className="text-sm">SAI is listening...</span>
            </div>
          )}
        </div>

        {/* Exit area */}
        <div className="flex-1 max-w-xl">
          {/* Speech bubble */}
          <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-border/50">
            {CurrentIcon && (
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <CurrentIcon className="w-7 h-7 text-primary" />
                </div>
              </div>
            )}
            
            <p className="text-lg text-foreground leading-relaxed text-center min-h-[60px]">
              {displayedText}
              {isSpeaking && <span className="animate-pulse ml-1">|</span>}
            </p>
          </div>

          {/* Progress */}
          <div className="flex justify-center gap-2 mt-6">
            {EXIT_MESSAGES.map((_, index) => (
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
                onClick={handleExit}
                className="animate-fade-in gap-2"
              >
                <DoorOpen className="w-5 h-5" />
                Head to My Safe Home
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
