import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FullBodySAI } from '@/components/sai/FullBodySAI';
import { Shield, Eye, Lock, UserCheck } from 'lucide-react';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useMicrophone } from '@/contexts/MicrophoneContext';
import comfortOfficeBg from '@/assets/comfort-office-bg.jpg';

/**
 * SecurityBriefing - Office with desk
 * 
 * SAI explains security warnings and the Watcher app with VOICE
 * Microphone activates when SAI asks questions
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
  const { speak, isSpeaking, stopSpeaking, voiceEnabled } = useVoiceSettings();
  const { enableMicrophone, isMicEnabled, lastTranscript, clearTranscript } = useMicrophone();
  
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [showContinue, setShowContinue] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [saiResponse, setSaiResponse] = useState<string | null>(null);
  
  const hasSpokenRef = useRef<Set<number>>(new Set());
  const lastProcessedTranscriptRef = useRef<string>('');

  // Handle speaking current message
  const speakCurrentMessage = useCallback(async () => {
    const message = SECURITY_MESSAGES[currentMessageIndex];
    setDisplayedText(message.text);
    
    if (!hasSpokenRef.current.has(currentMessageIndex)) {
      hasSpokenRef.current.add(currentMessageIndex);
      
      if (voiceEnabled) {
        await speak(message.text);
      }
      
      // After last message, wait for user response
      if (currentMessageIndex === SECURITY_MESSAGES.length - 1) {
        setIsWaitingForResponse(true);
        if (!isMicEnabled) {
          try {
            await enableMicrophone();
          } catch (e) {
            console.log('Mic enable failed');
          }
        }
        setTimeout(() => setShowContinue(true), 1000);
      } else {
        setTimeout(() => {
          setCurrentMessageIndex(prev => prev + 1);
        }, 2500);
      }
    }
  }, [currentMessageIndex, speak, voiceEnabled, enableMicrophone, isMicEnabled]);

  useEffect(() => {
    speakCurrentMessage();
  }, [currentMessageIndex, speakCurrentMessage]);

  // Handle user voice response
  useEffect(() => {
    if (isWaitingForResponse && lastTranscript && lastTranscript !== lastProcessedTranscriptRef.current) {
      lastProcessedTranscriptRef.current = lastTranscript;
      
      const lowerTranscript = lastTranscript.toLowerCase();
      
      if (lowerTranscript.includes('question') || lowerTranscript.includes('?') || lowerTranscript.includes('what') || lowerTranscript.includes('watcher') || lowerTranscript.includes('explain')) {
        const response = "The Watcher is completely optional. It's just a way for someone you trust to check on your general wellbeing — they never see your private conversations. You're always in control.";
        setSaiResponse(response);
        setDisplayedText(response);
        if (voiceEnabled) {
          speak(response);
        }
      } else if (lowerTranscript.includes('yes') || lowerTranscript.includes('understand') || lowerTranscript.includes('makes sense') || lowerTranscript.includes('okay') || lowerTranscript.includes('continue')) {
        handleContinue();
      } else if (lowerTranscript.includes('no') || lowerTranscript.includes('confused')) {
        const response = "That's okay, I can explain more. Your privacy is my top priority. Nothing leaves this space without your permission. Would you like to continue when you're ready?";
        setSaiResponse(response);
        setDisplayedText(response);
        if (voiceEnabled) {
          speak(response);
        }
      }
      
      clearTranscript();
    }
  }, [lastTranscript, isWaitingForResponse, voiceEnabled, speak, clearTranscript]);

  const handleContinue = () => {
    stopSpeaking();
    navigate('/onboarding/assessment');
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
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 px-6 max-w-5xl mx-auto">
        {/* SAI on left */}
        <div className="flex-shrink-0">
          <FullBodySAI 
            size="lg" 
            state={saiState} 
          />
          
          {/* Listening indicator */}
          {isWaitingForResponse && isMicEnabled && (
            <div className="flex items-center justify-center gap-2 text-primary animate-pulse mt-4">
              <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
              <span className="text-sm">Listening...</span>
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
