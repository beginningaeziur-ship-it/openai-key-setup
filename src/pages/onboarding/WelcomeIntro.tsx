import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RobotDogAvatar } from '@/components/sai/RobotDogAvatar';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { Volume2, VolumeX } from 'lucide-react';
import comfortOfficeBg from '@/assets/comfort-office-bg.jpg';

/**
 * WelcomeIntro - SAI introduces itself for the first time
 * 
 * This is where SAI first appears after the logo splash.
 * Office environment, SAI speaks, user continues.
 */

const INTRO_MESSAGES = [
  "I'm SAI — your service dog companion.",
  "I'll walk with you through every step.",
  "We go at your pace. You lead, I walk beside you.",
];

export default function WelcomeIntro() {
  const navigate = useNavigate();
  const { speak, voiceEnabled, setVoiceEnabled, isSpeaking, stopSpeaking } = useVoiceSettings();
  const [messageIndex, setMessageIndex] = useState(0);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    if (!voiceEnabled) {
      setIntroComplete(true);
      return;
    }

    // Speak each message in sequence
    const speakSequence = async () => {
      for (let i = 0; i < INTRO_MESSAGES.length; i++) {
        setMessageIndex(i);
        await speak(INTRO_MESSAGES[i]);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      setIntroComplete(true);
    };

    const timer = setTimeout(() => {
      speakSequence();
    }, 800);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, [voiceEnabled]);

  const handleContinue = () => {
    stopSpeaking();
    navigate('/onboarding/assessment');
  };

  const toggleVoice = () => {
    if (voiceEnabled) stopSpeaking();
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden">
      {/* Office background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${comfortOfficeBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

      {/* Volume control */}
      <div className="relative z-20 flex items-center justify-end p-4">
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
      </div>

      {/* Main content - SAI centered */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        {/* SAI avatar with glow */}
        <div className="relative mb-8">
          <div 
            className={cn(
              "absolute inset-0 rounded-full transition-all duration-500",
              isSpeaking ? "opacity-100 scale-[2.5]" : "opacity-50 scale-[2]"
            )}
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />
          <RobotDogAvatar 
            size="xl" 
            state={isSpeaking ? 'speaking' : 'attentive'}
            energyLevel="high"
            showBreathing={!isSpeaking}
          />
        </div>

        <span className="text-white/80 text-lg font-medium tracking-wide mb-6">SAI</span>

        {/* Message bubble */}
        <div className="max-w-md bg-black/50 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10 mb-8">
          <p className="text-white/90 text-lg text-center leading-relaxed">
            {INTRO_MESSAGES[messageIndex]}
          </p>
        </div>

        {/* Continue button */}
        <Button
          onClick={handleContinue}
          size="lg"
          disabled={!introComplete && voiceEnabled}
          className={cn(
            "w-full max-w-xs h-14 rounded-xl text-lg shadow-lg shadow-primary/30",
            "transition-all duration-300",
            (!introComplete && voiceEnabled) && "opacity-50"
          )}
        >
          I'm ready
        </Button>
        
        <p className="text-white/40 text-sm text-center mt-4">
          {voiceEnabled ? "Say 'ready' or tap the button" : "Tap to continue"}
        </p>
      </div>
    </div>
  );
}
