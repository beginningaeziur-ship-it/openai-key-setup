import React from 'react';
import { Volume2, VolumeX, CloudRain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface AmbientRainControlProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  onToggleMute: () => void;
  onPlay: () => void;
  onVolumeChange: (volume: number) => void;
  className?: string;
}

export function AmbientRainControl({
  isPlaying,
  isMuted,
  volume,
  onToggleMute,
  onPlay,
  onVolumeChange,
  className,
}: AmbientRainControlProps) {
  const handleClick = () => {
    if (!isPlaying) {
      onPlay();
    } else {
      onToggleMute();
    }
  };

  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-2.5 rounded-2xl',
      'bg-card/40 backdrop-blur-md border border-border/30',
      'transition-all duration-300',
      className
    )}>
      {/* Rain icon + label */}
      <div className="flex items-center gap-2 text-sm text-foreground/70">
        <CloudRain className="w-4 h-4" />
        <span className="hidden sm:inline">Room Sound</span>
      </div>
      
      {/* Volume slider */}
      <div className="w-20 sm:w-24">
        <Slider
          value={[isMuted ? 0 : volume * 100]}
          onValueChange={(vals) => onVolumeChange(vals[0] / 100)}
          max={100}
          step={1}
          className="cursor-pointer"
          disabled={!isPlaying}
        />
      </div>
      
      {/* Play/Mute button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className={cn(
          'h-8 w-8 rounded-full hover:bg-primary/20 transition-all',
          !isPlaying && 'text-muted-foreground'
        )}
        title={!isPlaying ? 'Tap to start rain' : isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted || !isPlaying ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
