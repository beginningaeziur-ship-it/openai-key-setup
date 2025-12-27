import React from 'react';
import { cn } from '@/lib/utils';
import { RobotDogAvatar } from '@/components/sai/RobotDogAvatar';
import { Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useMicrophone } from '@/contexts/MicrophoneContext';
import cozyCabinBg from '@/assets/cozy-cabin-bg.jpg';

/**
 * SAIAnchoredLayout - SAI is ALWAYS visible, UI is an overlay
 * 
 * HARD RULES:
 * - SAI is always visible when present
 * - UI elements are overlays, never replacements
 * - Background never changes during onboarding
 * - Nothing appears without SAI visible
 */

interface SAIAnchoredLayoutProps {
  children: React.ReactNode;
  saiMessage?: string;
  saiState?: 'resting' | 'speaking' | 'listening' | 'attentive';
  showOverlay?: boolean;
  overlayStyle?: 'glass' | 'paper';
}

export const SAIAnchoredLayout: React.FC<SAIAnchoredLayoutProps> = ({
  children,
  saiMessage,
  saiState = 'attentive',
  showOverlay = true,
  overlayStyle = 'glass',
}) => {
  const { isSpeaking, voiceEnabled, setVoiceEnabled, stopSpeaking } = useVoiceSettings();
  const { isMicEnabled, isListening, enableMicrophone, toggleMute, isMicMuted } = useMicrophone();

  const toggleVoice = () => {
    if (voiceEnabled) stopSpeaking();
    setVoiceEnabled(!voiceEnabled);
  };

  const actualSaiState = isSpeaking ? 'speaking' : isListening ? 'listening' : saiState;

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden">
      {/* Persistent cabin background - NEVER changes during onboarding */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${cozyCabinBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />

      {/* Top controls */}
      <div className="relative z-20 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
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

          <button
            onClick={isMicEnabled ? toggleMute : enableMicrophone}
            className={cn(
              "p-2.5 rounded-full transition-all",
              "bg-black/40 backdrop-blur-md border border-white/10",
              "hover:bg-black/60",
              isListening && !isMicMuted && "ring-2 ring-emerald-500/50"
            )}
          >
            {isMicEnabled && !isMicMuted ? (
              <Mic className={cn("w-5 h-5", isListening ? "text-emerald-400 animate-pulse" : "text-white/80")} />
            ) : (
              <MicOff className="w-5 h-5 text-white/50" />
            )}
          </button>
        </div>

        <div className={cn(
          "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
          "bg-black/40 backdrop-blur-md border border-white/10",
          isSpeaking && "border-primary/30 text-primary",
          isListening && !isMicMuted && "border-emerald-500/30 text-emerald-400",
          !isSpeaking && !isListening && "text-white/70"
        )}>
          {isSpeaking ? "SAI speaking..." : isListening && !isMicMuted ? "Listening..." : "Ready"}
        </div>
      </div>

      {/* Main content - SAI always visible + overlay */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-4 pb-6 overflow-y-auto">
        {/* SAI - Always present and visible */}
        <div className="flex flex-col items-center gap-3 py-4 shrink-0">
          <div className="relative">
            <div 
              className={cn(
                "absolute inset-0 rounded-full transition-all duration-500",
                isSpeaking ? "opacity-100 scale-[2]" : "opacity-40 scale-150"
              )}
              style={{
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
            <RobotDogAvatar 
              size="lg" 
              state={actualSaiState}
              energyLevel="high"
              showBreathing={!isSpeaking}
            />
          </div>
          
          <span className="text-white/80 text-sm font-medium tracking-wide">SAI</span>
          
          {/* SAI's message bubble */}
          {saiMessage && (
            <div className="max-w-sm bg-black/50 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10">
              <p className="text-white/90 text-sm text-center leading-relaxed">
                {saiMessage}
              </p>
            </div>
          )}
        </div>

        {/* Content overlay - appears below SAI */}
        {showOverlay && (
          <div className={cn(
            "flex-1 w-full max-w-md flex flex-col",
            overlayStyle === 'paper' && "max-w-lg"
          )}>
            {overlayStyle === 'glass' ? (
              <>{children}</>
            ) : (
              <PaperOverlay>{children}</PaperOverlay>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Paper overlay component for assessment screens
const PaperOverlay: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative">
      {/* Paper shadow */}
      <div 
        className="absolute inset-0 translate-x-2 translate-y-2 bg-black/30 rounded-sm blur-md"
        style={{ transform: 'translate(6px, 6px) rotate(0.3deg)' }}
      />
      
      {/* Paper */}
      <div 
        className={cn(
          "relative bg-amber-50 rounded-sm p-6",
          "shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
          "border border-amber-200/50"
        )}
        style={{
          transform: 'rotate(-0.3deg)',
          backgroundImage: `
            linear-gradient(transparent 0px, transparent 26px, #e5d5c0 26px, #e5d5c0 27px),
            linear-gradient(90deg, #f5efe6 0px, #faf8f4 100%)
          `,
          backgroundSize: '100% 28px, 100% 100%',
        }}
      >
        {/* Red margin line */}
        <div className="absolute left-10 top-0 bottom-0 w-[2px] bg-red-300/50" />
        
        {/* Hole punches */}
        <div className="absolute left-3 top-1/4 w-2.5 h-2.5 rounded-full bg-stone-700/70 shadow-inner" />
        <div className="absolute left-3 top-1/2 w-2.5 h-2.5 rounded-full bg-stone-700/70 shadow-inner" />
        <div className="absolute left-3 top-3/4 w-2.5 h-2.5 rounded-full bg-stone-700/70 shadow-inner" />
        
        {/* Content */}
        <div className="ml-6 space-y-4 text-stone-800">
          {children}
        </div>
      </div>
    </div>
  );
};
