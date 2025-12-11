import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Heart, Volume2, VolumeX, Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useMicrophone } from '@/contexts/MicrophoneContext';
import comfortOfficeBg from '@/assets/comfort-office-bg.jpg';
import comfortWaitingBg from '@/assets/comfort-waiting-bg.jpg';

interface ConversationalScreenProps {
  saiName?: string;
  backgroundVariant?: 'office' | 'waiting';
  // SAI's script - what SAI says (voice-first)
  saiScript: string;
  // Optional short headline for screen (minimal text)
  headline?: string;
  // Children for any action buttons or minimal UI
  children?: React.ReactNode;
  // Callback when SAI finishes speaking
  onSpeechComplete?: () => void;
  // Callback when user speaks
  onUserSpeech?: (transcript: string) => void;
  // Whether to listen for user response after SAI speaks
  listenAfterSpeech?: boolean;
  // Hesitation/silence detection callback
  onHesitation?: () => void;
  // Duration to wait before considering hesitation (ms)
  hesitationThreshold?: number;
}

export const ConversationalScreen: React.FC<ConversationalScreenProps> = ({
  saiName = 'SAI',
  backgroundVariant = 'office',
  saiScript,
  headline,
  children,
  onSpeechComplete,
  onUserSpeech,
  listenAfterSpeech = true,
  onHesitation,
  hesitationThreshold = 8000,
}) => {
  const [phase, setPhase] = useState<'entering' | 'speaking' | 'listening' | 'waiting'>('entering');
  const [showContent, setShowContent] = useState(false);
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  const [hasDetectedHesitation, setHasDetectedHesitation] = useState(false);
  
  const { speak, stopSpeaking, isSpeaking, voiceEnabled, setVoiceEnabled, isLoading } = useVoiceSettings();
  const { 
    isMicEnabled,
    isMicMuted,
    isListening, 
    lastTranscript, 
    enableMicrophone,
    toggleMute,
    clearTranscript,
    hasPermission 
  } = useMicrophone();
  
  const lastTranscriptRef = useRef<string>('');
  const hasSpokeRef = useRef(false);

  const bgImage = backgroundVariant === 'office' ? comfortOfficeBg : comfortWaitingBg;

  // Start SAI speaking when component mounts
  useEffect(() => {
    const timer = setTimeout(async () => {
      setPhase('speaking');
      setShowContent(true);
      
      if (voiceEnabled && !hasSpokeRef.current) {
        hasSpokeRef.current = true;
        await speak(saiScript);
        setPhase(listenAfterSpeech ? 'listening' : 'waiting');
        onSpeechComplete?.();
        
        // Start listening for user response
        if (listenAfterSpeech && isMicEnabled && !isSpeaking) {
          startHesitationTimer();
        }
      } else if (!voiceEnabled) {
        // No voice, just show content
        setTimeout(() => {
          setPhase(listenAfterSpeech ? 'listening' : 'waiting');
          onSpeechComplete?.();
        }, 2000);
      }
    }, 800);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
      if (silenceTimer) clearTimeout(silenceTimer);
    };
  }, []);

  // Monitor for user speech
  useEffect(() => {
    if (lastTranscript && lastTranscript !== lastTranscriptRef.current) {
      lastTranscriptRef.current = lastTranscript;
      
      // Clear hesitation timer when user speaks
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
      setHasDetectedHesitation(false);
      
      onUserSpeech?.(lastTranscript);
      clearTranscript();
      
      // Restart hesitation timer after user speaks
      if (phase === 'listening') {
        startHesitationTimer();
      }
    }
  }, [lastTranscript, onUserSpeech, clearTranscript, phase]);

  const startHesitationTimer = useCallback(() => {
    if (silenceTimer) clearTimeout(silenceTimer);
    
    const timer = setTimeout(() => {
      if (!hasDetectedHesitation && onHesitation) {
        setHasDetectedHesitation(true);
        onHesitation();
      }
    }, hesitationThreshold);
    
    setSilenceTimer(timer);
  }, [hesitationThreshold, onHesitation, hasDetectedHesitation, silenceTimer]);

  const toggleVoice = () => {
    if (voiceEnabled) {
      stopSpeaking();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const handleEnableMic = async () => {
    await enableMicrophone();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-black/40" />

      {/* Top controls */}
      <div className="relative z-20 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {/* Voice toggle */}
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

          {/* Mic toggle */}
          <button
            onClick={isMicEnabled ? toggleMute : handleEnableMic}
            className={cn(
              "p-2.5 rounded-full transition-all",
              "bg-black/40 backdrop-blur-md border border-white/10",
              "hover:bg-black/60",
              isListening && !isMicMuted && "ring-2 ring-emerald-500/50"
            )}
            title={isMicEnabled ? (isMicMuted ? "Unmute microphone" : "Mute microphone") : "Enable microphone"}
          >
            {isMicEnabled && !isMicMuted ? (
              <Mic className={cn("w-5 h-5", isListening ? "text-emerald-400 animate-pulse" : "text-white/80")} />
            ) : (
              <MicOff className="w-5 h-5 text-white/50" />
            )}
          </button>
        </div>

        {/* Status indicator */}
        <div className={cn(
          "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
          "bg-black/40 backdrop-blur-md border border-white/10",
          phase === 'speaking' && "border-primary/30 text-primary",
          phase === 'listening' && !isMicMuted && "border-emerald-500/30 text-emerald-400",
        )}>
          {isLoading && "Thinking..."}
          {isSpeaking && "SAI speaking..."}
          {phase === 'listening' && !isSpeaking && (isListening && !isMicMuted ? "Listening..." : isMicMuted ? "Mic muted" : "Your turn")}
          {phase === 'waiting' && !isSpeaking && "Ready"}
        </div>
      </div>

      {/* Main content area - centered */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        
        {/* SAI Avatar */}
        <div 
          className={cn(
            "relative transition-all duration-700 mb-6",
            showContent ? "scale-100 opacity-100" : "scale-75 opacity-0"
          )}
        >
          {/* Glow effect */}
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
            "relative w-20 h-20 rounded-full",
            "bg-gradient-to-br from-primary/60 to-primary/30",
            "flex items-center justify-center",
            "border-2 border-primary/40 shadow-xl",
            isSpeaking && "animate-pulse"
          )}>
            <Heart className="w-8 h-8 text-white" />
          </div>
          
          {/* Name */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-black/60 backdrop-blur rounded-full">
            <span className="text-xs font-medium text-white">{saiName}</span>
          </div>

          {/* Speaking waves */}
          {isSpeaking && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full animate-pulse"
                  style={{
                    height: `${8 + Math.random() * 12}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.5s',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Minimal headline - only shown if voice is off */}
        {headline && !voiceEnabled && (
          <h1 
            className={cn(
              "text-xl font-light text-white text-center mb-4 transition-all duration-500",
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            {headline}
          </h1>
        )}

        {/* Text display - only shown when voice is muted */}
        {!voiceEnabled && (
          <div 
            className={cn(
              "max-w-md text-center transition-all duration-500 delay-200",
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <p className="text-white/70 text-sm leading-relaxed">
              {saiScript}
            </p>
          </div>
        )}

        {/* Listening indicator when it's user's turn */}
        {phase === 'listening' && isListening && !isMicMuted && !isSpeaking && (
          <div 
            className={cn(
              "mt-6 flex flex-col items-center gap-2 transition-all duration-500",
              "animate-fade-in"
            )}
          >
            <div className="flex items-center gap-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-emerald-400 rounded-full animate-bounce"
                  style={{
                    height: `${12 + Math.random() * 8}px`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
            <p className="text-emerald-400/80 text-xs">Speak anytime...</p>
          </div>
        )}

        {/* Enable mic prompt if not enabled or muted */}
        {phase === 'listening' && (!isMicEnabled || isMicMuted) && !isSpeaking && (
          <Button
            onClick={isMicEnabled ? toggleMute : handleEnableMic}
            variant="outline"
            size="sm"
            className="mt-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Mic className="w-4 h-4 mr-2" />
            {isMicEnabled ? "Unmute to respond" : "Enable microphone to respond"}
          </Button>
        )}
      </div>

      {/* Bottom actions area */}
      <div className="relative z-10 p-6 pb-8">
        <div 
          className={cn(
            "flex flex-col items-center gap-3 transition-all duration-500 delay-300",
            showContent && phase !== 'speaking' ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          {children}
        </div>
      </div>

      {/* Subtle ambient particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `float-particle ${7 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.15; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};
