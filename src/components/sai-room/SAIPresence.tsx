import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface SAIPresenceProps {
  saiName: string;
  message?: string;
  isSpeaking?: boolean;
  className?: string;
}

export function SAIPresence({ saiName, message, isSpeaking, className }: SAIPresenceProps) {
  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* SAI Avatar */}
      <div className="relative">
        {/* Breathing glow */}
        <div className={cn(
          'absolute inset-0 rounded-full bg-primary/30 blur-xl transition-all duration-1000',
          isSpeaking ? 'scale-150 opacity-60' : 'scale-100 opacity-40 animate-breathe'
        )} />
        
        {/* Avatar circle */}
        <div className={cn(
          'relative w-24 h-24 rounded-full flex items-center justify-center',
          'bg-gradient-to-br from-primary/40 to-primary/20',
          'border-2 border-primary/50 shadow-lg shadow-primary/20',
          'transition-all duration-300',
          isSpeaking && 'border-primary scale-110'
        )}>
          <Sparkles className={cn(
            'w-10 h-10 text-primary transition-all duration-300',
            isSpeaking && 'animate-pulse'
          )} />
        </div>

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* SAI Name */}
      <span className="text-lg font-display font-semibold text-foreground">
        {saiName}
      </span>

      {/* Message bubble */}
      {message && (
        <div className="max-w-sm text-center px-6 py-4 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/30">
          <p className="text-sm text-foreground/90 leading-relaxed">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
