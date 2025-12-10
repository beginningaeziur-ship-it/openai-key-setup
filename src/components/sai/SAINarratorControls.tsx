import React from 'react';
import { Volume2, VolumeX, RotateCcw, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSAINarrator } from '@/contexts/SAINarratorContext';
import { useMicrophone } from '@/contexts/MicrophoneContext';
import { cn } from '@/lib/utils';

interface SAINarratorControlsProps {
  className?: string;
  showRepeat?: boolean;
  showMute?: boolean;
  showMic?: boolean;
  compact?: boolean;
}

export function SAINarratorControls({
  className,
  showRepeat = true,
  showMute = true,
  showMic = true,
  compact = false,
}: SAINarratorControlsProps) {
  const { isMuted, isNarrating, toggleMute, repeatNarration, isListening } = useSAINarrator();
  const { isEnabled: micEnabled, toggleMicrophone } = useMicrophone();

  return (
    <div className={cn(
      'flex items-center gap-2',
      compact ? 'gap-1' : 'gap-2',
      className
    )}>
      {/* Repeat Button */}
      {showRepeat && (
        <Button
          variant="ghost"
          size={compact ? 'sm' : 'default'}
          onClick={repeatNarration}
          disabled={isNarrating}
          className="text-foreground/70 hover:text-foreground hover:bg-foreground/10"
          title="Repeat this part"
        >
          <RotateCcw className={cn('h-4 w-4', !compact && 'mr-1')} />
          {!compact && <span className="text-sm">Repeat</span>}
        </Button>
      )}

      {/* Mute/Unmute Button */}
      {showMute && (
        <Button
          variant="ghost"
          size={compact ? 'sm' : 'default'}
          onClick={toggleMute}
          className={cn(
            'hover:bg-foreground/10',
            isMuted ? 'text-destructive' : 'text-foreground/70 hover:text-foreground'
          )}
          title={isMuted ? 'Unmute voice' : 'Mute voice'}
        >
          {isMuted ? (
            <VolumeX className={cn('h-4 w-4', !compact && 'mr-1')} />
          ) : (
            <Volume2 className={cn('h-4 w-4', !compact && 'mr-1')} />
          )}
          {!compact && <span className="text-sm">{isMuted ? 'Unmuted' : 'Muted'}</span>}
        </Button>
      )}

      {/* Mic Button */}
      {showMic && (
        <Button
          variant="ghost"
          size={compact ? 'sm' : 'default'}
          onClick={toggleMicrophone}
          className={cn(
            'hover:bg-foreground/10 transition-all',
            isListening && 'animate-pulse bg-primary/20',
            !micEnabled ? 'text-muted-foreground' : 'text-foreground/70 hover:text-foreground'
          )}
          title={micEnabled ? 'Microphone on' : 'Microphone off'}
        >
          {micEnabled ? (
            <Mic className={cn('h-4 w-4', !compact && 'mr-1', isListening && 'text-primary')} />
          ) : (
            <MicOff className={cn('h-4 w-4', !compact && 'mr-1')} />
          )}
          {!compact && <span className="text-sm">{micEnabled ? 'Mic On' : 'Mic Off'}</span>}
        </Button>
      )}
    </div>
  );
}
