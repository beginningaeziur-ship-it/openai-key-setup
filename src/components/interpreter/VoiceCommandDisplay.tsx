import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceCommandDisplayProps {
  isListening: boolean;
  isProcessing: boolean;
  interimText: string;
  lastCommand: string | null;
}

export function VoiceCommandDisplay({
  isListening,
  isProcessing,
  interimText,
  lastCommand,
}: VoiceCommandDisplayProps) {
  const displayText = interimText || lastCommand || (isListening ? 'Listening...' : 'Say a command');

  return (
    <div
      className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border border-border min-h-[64px]"
      aria-live="polite"
      aria-label="Voice command display"
    >
      <div className="flex-shrink-0">
        {isProcessing ? (
          <Loader2 className="w-6 h-6 text-primary animate-spin" aria-label="Processing" />
        ) : isListening ? (
          <div className="relative">
            <Mic className="w-6 h-6 text-primary" aria-label="Microphone active" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
          </div>
        ) : (
          <MicOff className="w-6 h-6 text-muted-foreground" aria-label="Microphone inactive" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm truncate transition-colors',
            interimText ? 'text-muted-foreground italic' : 'text-foreground',
            !interimText && !lastCommand && 'text-muted-foreground'
          )}
        >
          {displayText}
        </p>
      </div>

      {isListening && (
        <div className="flex items-center gap-0.5 flex-shrink-0" aria-hidden>
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="w-0.5 bg-primary rounded-full animate-pulse"
              style={{
                height: `${8 + (i % 3) * 6}px`,
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
