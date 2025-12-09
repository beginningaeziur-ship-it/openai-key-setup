import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AmbientSoundControlProps {
  isPlaying: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onPlay: () => void;
  className?: string;
}

export function AmbientSoundControl({
  isPlaying,
  isMuted,
  onToggleMute,
  onPlay,
  className,
}: AmbientSoundControlProps) {
  const handleClick = () => {
    if (!isPlaying) {
      onPlay();
    } else {
      onToggleMute();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={cn(
        'h-10 w-10 rounded-full bg-background/20 backdrop-blur-sm border border-border/30 hover:bg-background/40 transition-all',
        className
      )}
      title={isMuted ? 'Unmute ambient sounds' : 'Mute ambient sounds'}
    >
      {isMuted || !isPlaying ? (
        <VolumeX className="h-5 w-5 text-foreground/70" />
      ) : (
        <Volume2 className="h-5 w-5 text-foreground/70" />
      )}
    </Button>
  );
}
