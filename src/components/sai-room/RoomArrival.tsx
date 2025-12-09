import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { playElevenLabsVoice } from '@/voice/elevenlabs';

interface RoomArrivalProps {
  userName: string;
  saiName: string;
  onComplete: () => void;
}

export function RoomArrival({ userName, saiName, onComplete }: RoomArrivalProps) {
  const [phase, setPhase] = useState<'entering' | 'greeting' | 'tour' | 'fading' | 'complete'>('entering');

  const speakGreeting = useCallback(async () => {
    await playElevenLabsVoice(
      `You made it, ${userName}. I'm ${saiName}. This is your space. You're safe here. We move at your pace.`
    );
  }, [userName, saiName]);

  const speakTour = useCallback(async () => {
    await playElevenLabsVoice(
      `Each object in this room has a purpose. Tap anything when you're ready.`
    );
  }, []);

  useEffect(() => {
    const runSequence = async () => {
      // Phase 1: Entering fade-in
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Phase 2: Greeting with voice
      setPhase('greeting');
      await speakGreeting();
      
      // Phase 3: Tour hint with voice
      await new Promise(resolve => setTimeout(resolve, 500));
      setPhase('tour');
      await speakTour();
      
      // Phase 4: Fade out
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPhase('fading');
      
      // Phase 5: Complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPhase('complete');
      onComplete();
    };

    runSequence();
  }, [speakGreeting, speakTour, onComplete]);

  if (phase === 'complete') return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-6",
        "bg-black/50 backdrop-blur-sm",
        "transition-opacity duration-1000 ease-out",
        phase === 'fading' && 'opacity-0 pointer-events-none'
      )}
    >
      {/* Soft ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative max-w-md w-full bg-card/90 backdrop-blur-md border border-border/40 rounded-2xl p-8 text-center shadow-2xl">
        {/* SAI gentle presence indicator */}
        <div className="flex justify-center mb-6">
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

        {/* Welcome heading */}
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Welcome, {userName}
        </h2>

        {/* Phase-specific message */}
        <div className="space-y-3 text-sm text-foreground/80 min-h-[60px]">
          {phase === 'entering' && (
            <p className="animate-fade-in text-muted-foreground">
              Entering your space...
            </p>
          )}
          
          {phase === 'greeting' && (
            <p className="animate-fade-in">
              This is your <strong className="text-primary">{saiName}</strong> Room.
              <br />
              Take your time. Nothing here demands anything from you.
            </p>
          )}
          
          {phase === 'tour' && (
            <p className="animate-fade-in">
              Each object has a purpose.
              <br />
              Tap anything when you're ready.
            </p>
          )}
          
          {phase === 'fading' && (
            <p className="animate-fade-in text-muted-foreground">
              Opening your room...
            </p>
          )}
        </div>

        {/* Progress indicator */}
        <div className="mt-6 flex justify-center gap-2">
          {['entering', 'greeting', 'tour', 'fading'].map((p, i) => (
            <div 
              key={p}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-500",
                ['entering', 'greeting', 'tour', 'fading'].indexOf(phase) >= i 
                  ? 'bg-primary/60' 
                  : 'bg-primary/20'
              )}
            />
          ))}
        </div>

        {/* Skip button */}
        <button
          onClick={() => {
            setPhase('complete');
            onComplete();
          }}
          className={cn(
            "text-xs text-muted-foreground/50 hover:text-muted-foreground/70",
            "transition-all duration-500 mt-6",
            "focus:outline-none"
          )}
        >
          tap to skip
        </button>
      </div>
    </div>
  );
}
