import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FullBodySAI } from '@/components/sai/FullBodySAI';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useMicrophone } from '@/contexts/MicrophoneContext';
import comfortWaitingBg from '@/assets/comfort-waiting-bg.jpg';

/**
 * WaitingRoom - First screen where SAI appears
 * 
 * Office waiting room environment with full-bodied SAI robot dog
 * SAI introduces itself and explains its purpose with VOICE
 * Microphone activates when SAI waits for response
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
    const message = INTRO_MESSAGES[currentMessageIndex];
    setDisplayedText(message);
    
    // Only speak if we haven't spoken this message yet
    if (!hasSpokenRef.current.has(currentMessageIndex)) {
      hasSpokenRef.current.add(currentMessageIndex);
      
      if (voiceEnabled) {
        await speak(message);
      }
      
      // After last message, wait for user response
      if (currentMessageIndex === INTRO_MESSAGES.length - 1) {
        setIsWaitingForResponse(true);
        // Enable mic for response
        if (!isMicEnabled) {
          try {
            await enableMicrophone();
          } catch (e) {
            console.log('Mic enable failed, showing continue button');
          }
        }
        setTimeout(() => setShowContinue(true), 1000);
      } else {
        // Auto-advance after delay
        setTimeout(() => {
          setCurrentMessageIndex(prev => prev + 1);
        }, 2000);
      }
    }
  }, [currentMessageIndex, speak, voiceEnabled, enableMicrophone, isMicEnabled]);

  // Speak message when index changes
  useEffect(() => {
    speakCurrentMessage();
  }, [currentMessageIndex, speakCurrentMessage]);

  // Handle user voice response
  useEffect(() => {
    if (isWaitingForResponse && lastTranscript && lastTranscript !== lastProcessedTranscriptRef.current) {
      lastProcessedTranscriptRef.current = lastTranscript;
      
      const lowerTranscript = lastTranscript.toLowerCase();
      
      // Check for questions or concerns
      if (lowerTranscript.includes('question') || lowerTranscript.includes('?') || lowerTranscript.includes('what') || lowerTranscript.includes('how') || lowerTranscript.includes('why')) {
        // SAI responds to question
        const response = "That's a great question. I'm here to support you through whatever you're facing. We'll take this one step at a time, and you can always ask me anything along the way. Ready to continue?";
        setSaiResponse(response);
        setDisplayedText(response);
        if (voiceEnabled) {
          speak(response);
        }
      } else if (lowerTranscript.includes('yes') || lowerTranscript.includes('ready') || lowerTranscript.includes('continue') || lowerTranscript.includes('okay') || lowerTranscript.includes('ok')) {
        // User ready to continue
        handleContinue();
      } else if (lowerTranscript.includes('no') || lowerTranscript.includes('wait') || lowerTranscript.includes('not sure')) {
        // User needs more time
        const response = "Take all the time you need. There's no rush here. Just let me know when you're ready.";
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
    navigate('/onboarding/security');
  };

  const saiState = isSpeaking ? 'speaking' : isWaitingForResponse ? 'listening' : 'attentive';

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center"
      style={{
        backgroundImage: `url(${comfortWaitingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-2xl mx-auto text-center">
        {/* Full-bodied SAI */}
        <FullBodySAI 
          size="lg" 
          state={saiState} 
          className="mb-4"
        />
        
        {/* Listening indicator */}
        {isWaitingForResponse && isMicEnabled && (
          <div className="flex items-center gap-2 text-primary animate-pulse">
            <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
            <span className="text-sm">Listening...</span>
          </div>
        )}
        
        {/* Speech bubble */}
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-border/50 min-h-[120px] flex items-center justify-center">
          <p className="text-lg md:text-xl text-foreground leading-relaxed">
            {displayedText}
            {isSpeaking && <span className="animate-pulse ml-1">|</span>}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2">
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
        
        {/* Continue button */}
        {showContinue && (
          <Button 
            size="lg"
            onClick={handleContinue}
            className="animate-fade-in"
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
