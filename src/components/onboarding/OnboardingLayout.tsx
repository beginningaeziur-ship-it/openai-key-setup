import React from 'react';
import { cn } from '@/lib/utils';
import { RobotDogAvatar } from '@/components/sai/RobotDogAvatar';
import { Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useMicrophone } from '@/contexts/MicrophoneContext';
import cozyCabinBg from '@/assets/cozy-cabin-bg.jpg';

/**
 * OnboardingLayout - Unified layout for all onboarding screens
 * 
 * UI Spec Rules:
 * - Background never changes during onboarding. Only overlays change.
 * - Sai is always visible on one side
 * - Sai never becomes text-only or a floating status indicator
 * - Sai always has a body
 */

interface OnboardingLayoutProps {
  children: React.ReactNode;
  saiMessage?: string;
  saiState?: 'resting' | 'speaking' | 'listening' | 'attentive';
  showSaiMessage?: boolean;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  saiMessage,
  saiState = 'attentive',
  showSaiMessage = true,
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

        {/* Status */}
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

      {/* Main content - Split layout: Sai + Content overlay */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-4 pb-6 overflow-y-auto">
        {/* Sai always present at top */}
        <div className="flex flex-col items-center gap-3 py-4 shrink-0">
          <div className="relative">
            {/* Glow */}
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
          
          {/* Sai's name */}
          <span className="text-white/80 text-sm font-medium tracking-wide">SAI</span>
          
          {/* Sai's message bubble - appears as overlay, not separate screen */}
          {showSaiMessage && saiMessage && (
            <div className="max-w-sm bg-black/50 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10">
              <p className="text-white/90 text-sm text-center leading-relaxed">
                {saiMessage}
              </p>
            </div>
          )}
        </div>

        {/* Content overlay - the "notebook" that appears/disappears */}
        <div className="flex-1 w-full max-w-md flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};