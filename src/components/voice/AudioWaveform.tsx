// Audio Waveform Visualizer Component
import { cn } from '@/lib/utils';
import { useSpeechOnly } from '@/contexts/SpeechOnlyContext';

interface AudioWaveformProps {
  className?: string;
  barCount?: number;
  color?: string;
}

export function AudioWaveform({ 
  className,
  barCount = 24,
  color = 'bg-primary',
}: AudioWaveformProps) {
  const { waveformData, isListening, audioLevel } = useSpeechOnly();
  
  // Take evenly spaced samples from waveform data
  const bars = [];
  const step = Math.max(1, Math.floor(waveformData.length / barCount));
  
  for (let i = 0; i < barCount; i++) {
    const index = Math.min(i * step, waveformData.length - 1);
    bars.push(waveformData[index] || 0);
  }

  return (
    <div className={cn(
      'flex items-center justify-center gap-0.5 h-16',
      className
    )}>
      {bars.map((value, i) => {
        // Add some visual flair - mirror effect
        const height = isListening 
          ? Math.max(8, value * 100) 
          : 8 + Math.sin(Date.now() / 500 + i * 0.3) * 4;
        
        return (
          <div
            key={i}
            className={cn(
              'w-1 rounded-full transition-all duration-75',
              color,
              isListening ? 'opacity-90' : 'opacity-40'
            )}
            style={{ 
              height: `${height}%`,
              transform: `scaleY(${isListening ? 1 : 0.5})`,
            }}
          />
        );
      })}
    </div>
  );
}

// Circular version for mic button
export function CircularWaveform({
  size = 120,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const { audioLevel, isListening } = useSpeechOnly();
  
  const pulseSize = isListening ? 1 + audioLevel * 0.3 : 1;
  
  return (
    <div 
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      {/* Outer pulse rings */}
      {isListening && (
        <>
          <div 
            className="absolute inset-0 rounded-full bg-primary/20 animate-ping"
            style={{ 
              animationDuration: '1.5s',
              transform: `scale(${pulseSize})`,
            }}
          />
          <div 
            className="absolute inset-2 rounded-full bg-primary/15 animate-ping"
            style={{ 
              animationDuration: '2s',
              animationDelay: '0.3s',
              transform: `scale(${pulseSize})`,
            }}
          />
        </>
      )}
      
      {/* Main circle */}
      <div 
        className={cn(
          'absolute rounded-full transition-all duration-150',
          isListening 
            ? 'bg-primary shadow-lg shadow-primary/40' 
            : 'bg-primary/80'
        )}
        style={{ 
          width: size * 0.6,
          height: size * 0.6,
          transform: `scale(${pulseSize})`,
        }}
      />
      
      {/* Inner glow based on audio level */}
      {isListening && (
        <div 
          className="absolute rounded-full bg-white/30 transition-all duration-100"
          style={{ 
            width: size * 0.4,
            height: size * 0.4,
            opacity: 0.3 + audioLevel * 0.7,
          }}
        />
      )}
    </div>
  );
}
