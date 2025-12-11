import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Heart, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useMicrophone } from '@/contexts/MicrophoneContext';
import comfortWaitingBg from '@/assets/comfort-waiting-bg.jpg';

interface NicknameSetupProps {
  onComplete: (nickname: string) => void;
  onBack?: () => void;
}

export const NicknameSetup: React.FC<NicknameSetupProps> = ({
  onComplete,
}) => {
  const [nickname, setNickname] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [hasSpokeIntro, setHasSpokeIntro] = useState(false);
  
  const { speak, stopSpeaking, isSpeaking, voiceEnabled, setVoiceEnabled } = useVoiceSettings();
  const { isMicEnabled, isListening, lastTranscript, enableMicrophone, clearTranscript } = useMicrophone();

  const introScript = "Tell me what you want me to call you. Not your real name — something safe and comfortable for you.";

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(async () => {
      if (voiceEnabled && !hasSpokeIntro) {
        setHasSpokeIntro(true);
        await speak(introScript);
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, []);

  // Handle voice input for nickname
  useEffect(() => {
    if (lastTranscript && lastTranscript.length > 1) {
      // Extract a reasonable nickname from speech
      const words = lastTranscript.trim().split(' ');
      // Take first word or "call me X" pattern
      let extractedName = words[0];
      
      const callMeIndex = lastTranscript.toLowerCase().indexOf('call me');
      if (callMeIndex !== -1) {
        const afterCallMe = lastTranscript.slice(callMeIndex + 7).trim();
        extractedName = afterCallMe.split(' ')[0] || extractedName;
      }

      if (extractedName && extractedName.length > 1) {
        setNickname(extractedName.charAt(0).toUpperCase() + extractedName.slice(1).toLowerCase());
      }
      clearTranscript();
    }
  }, [lastTranscript, clearTranscript]);

  const handleContinue = async () => {
    if (nickname.trim()) {
      if (voiceEnabled) {
        await speak(`Nice to meet you, ${nickname}. I'll remember that.`);
      }
      onComplete(nickname.trim());
    }
  };

  const toggleVoice = () => {
    if (voiceEnabled) stopSpeaking();
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex flex-col overflow-hidden",
        "transition-opacity duration-700",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${comfortWaitingBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-black/40" />

      {/* Top controls */}
      <div className="relative z-20 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleVoice}
            className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60"
          >
            {voiceEnabled ? (
              <Volume2 className={cn("w-5 h-5", isSpeaking ? "text-primary animate-pulse" : "text-white/80")} />
            ) : (
              <VolumeX className="w-5 h-5 text-white/50" />
            )}
          </button>
          <button
            onClick={!isMicEnabled ? enableMicrophone : undefined}
            className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60"
          >
            {isMicEnabled ? (
              <Mic className={cn("w-5 h-5", isListening ? "text-emerald-400 animate-pulse" : "text-white/80")} />
            ) : (
              <MicOff className="w-5 h-5 text-white/50" />
            )}
          </button>
        </div>
        <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-black/40 backdrop-blur-md border border-white/10 text-white/70">
          {isSpeaking ? "SAI speaking..." : isListening ? "Listening..." : "Ready"}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        {/* SAI Avatar */}
        <div className="relative mb-6">
          <div 
            className={cn(
              "absolute inset-0 rounded-full transition-all duration-500",
              isSpeaking ? "opacity-100 scale-150" : "opacity-40 scale-125"
            )}
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
              filter: 'blur(25px)',
            }}
          />
          <div className={cn(
            "relative w-16 h-16 rounded-full bg-gradient-to-br from-primary/60 to-primary/30",
            "flex items-center justify-center border-2 border-primary/40",
            isSpeaking && "animate-pulse"
          )}>
            <Heart className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Nickname Card */}
        <div className="w-full max-w-xs bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 p-6">
          <p className="text-white/80 text-sm text-center mb-4">
            What should I call you?
          </p>

          <Input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Your safe name..."
            className={cn(
              "h-14 text-center text-lg",
              "bg-white/10 border-white/20 text-white placeholder:text-white/30"
            )}
            maxLength={20}
            autoFocus
          />

          <p className="text-white/40 text-xs text-center mt-3">
            {isMicEnabled ? "Say your name or type it" : "Type a nickname"}
          </p>
        </div>
      </div>

      {/* Bottom action */}
      <div className="relative z-10 p-6 pb-8">
        <Button
          onClick={handleContinue}
          size="lg"
          className="w-full max-w-xs mx-auto h-12 rounded-xl shadow-lg shadow-primary/30 block"
          disabled={!nickname.trim()}
        >
          Continue
        </Button>
        <p className="text-white/40 text-xs text-center mt-3">
          This stays between us
        </p>
      </div>
    </div>
  );
};
