import React from 'react';
import { cn } from '@/lib/utils';
import { Mic, MicOff } from 'lucide-react';
import { useMicrophone } from '@/contexts/MicrophoneContext';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GlobalMicButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'floating' | 'inline';
}

export const GlobalMicButton: React.FC<GlobalMicButtonProps> = ({
  className,
  size = 'md',
  variant = 'inline',
}) => {
  const { 
    isMicEnabled, 
    isMicMuted, 
    isListening,
    toggleMute,
    enableMicrophone,
  } = useMicrophone();

  const handleClick = async () => {
    if (!isMicEnabled) {
      await enableMicrophone();
    } else {
      toggleMute();
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const isActive = isMicEnabled && !isMicMuted;

  if (variant === 'floating') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className={cn(
              "fixed bottom-6 right-6 z-50 rounded-full shadow-lg",
              "transition-all duration-300 transform hover:scale-105",
              "flex items-center justify-center",
              sizeClasses.lg,
              isActive
                ? "bg-primary text-primary-foreground shadow-primary/30"
                : "bg-card text-muted-foreground border border-border hover:text-foreground",
              isListening && "animate-pulse ring-4 ring-primary/30",
              className
            )}
          >
            {isActive ? (
              <Mic className={iconSizes.lg} />
            ) : (
              <MicOff className={iconSizes.lg} />
            )}
            {/* Active listening indicator */}
            {isListening && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">
          {!isMicEnabled 
            ? 'Enable microphone' 
            : isMicMuted 
              ? 'Unmute microphone' 
              : 'Mute microphone'}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleClick}
          className={cn(
            "rounded-full transition-all duration-300",
            "flex items-center justify-center",
            sizeClasses[size],
            isActive
              ? "bg-primary/20 text-primary hover:bg-primary/30"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
            isListening && "ring-2 ring-primary/50",
            className
          )}
        >
          {isActive ? (
            <Mic className={iconSizes[size]} />
          ) : (
            <MicOff className={iconSizes[size]} />
          )}
          {/* Active listening indicator */}
          {isListening && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        {!isMicEnabled 
          ? 'Enable microphone' 
          : isMicMuted 
            ? 'Unmute microphone' 
            : 'Mute microphone'}
      </TooltipContent>
    </Tooltip>
  );
};