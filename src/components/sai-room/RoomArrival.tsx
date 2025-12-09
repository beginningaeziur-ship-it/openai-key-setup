import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface RoomArrivalProps {
  userName: string;
  saiName: string;
  onComplete: () => void;
}

export function RoomArrival({ userName, saiName, onComplete }: RoomArrivalProps) {
  const [phase, setPhase] = useState<'welcome' | 'intro' | 'fading' | 'complete'>('welcome');

  useEffect(() => {
    // Phase 1: Show welcome message
    const welcomeTimer = setTimeout(() => setPhase('intro'), 2500);
    
    // Phase 2: Show intro message
    const introTimer = setTimeout(() => setPhase('fading'), 5000);
    
    // Phase 3: Fade out and complete
    const fadeTimer = setTimeout(() => {
      setPhase('complete');
      onComplete();
    }, 6500);

    return () => {
      clearTimeout(welcomeTimer);
      clearTimeout(introTimer);
      clearTimeout(fadeTimer);
    };
  }, [onComplete]);

  if (phase === 'complete') return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-6",
        "bg-background/95 backdrop-blur-md",
        "transition-opacity duration-1000 ease-out",
        phase === 'fading' && 'opacity-0 pointer-events-none'
      )}
    >
      <div className="max-w-md w-full text-center space-y-8">
        {/* SAI gentle presence indicator */}
        <div className="flex justify-center">
          <div 
            className={cn(
              "w-20 h-20 rounded-full",
              "bg-gradient-to-br from-primary/30 to-primary/10",
              "flex items-center justify-center",
              "animate-arrival-breathe"
            )}
          >
            <div 
              className={cn(
                "w-12 h-12 rounded-full",
                "bg-gradient-to-br from-primary/50 to-primary/20",
                "animate-arrival-glow"
              )}
            />
          </div>
        </div>

        {/* Welcome text - first line */}
        <div 
          className={cn(
            "transition-all duration-1000 ease-out",
            phase === 'welcome' ? 'opacity-100 translate-y-0' : 'opacity-60 -translate-y-2'
          )}
        >
          <p className="text-xl text-foreground/90 leading-relaxed font-light">
            You made it.
          </p>
          <p className="text-lg text-foreground/70 mt-3 leading-relaxed">
            This is your space. Nothing here demands anything from you.
          </p>
        </div>

        {/* Intro text - second line */}
        <div 
          className={cn(
            "transition-all duration-1000 ease-out delay-300",
            (phase === 'intro' || phase === 'fading') 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          )}
        >
          <p className="text-base text-muted-foreground leading-relaxed">
            I'm {saiName}. I stay steady and quiet with you.
          </p>
          <p className="text-base text-muted-foreground mt-2 leading-relaxed">
            We move at your pace.
          </p>
        </div>

        {/* Subtle skip hint */}
        <button
          onClick={() => {
            setPhase('complete');
            onComplete();
          }}
          className={cn(
            "text-xs text-muted-foreground/50 hover:text-muted-foreground/70",
            "transition-all duration-500 mt-8",
            "focus:outline-none"
          )}
        >
          tap to continue
        </button>
      </div>
    </div>
  );
}
