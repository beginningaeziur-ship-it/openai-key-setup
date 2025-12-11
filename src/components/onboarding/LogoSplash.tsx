import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import aezuirLogo from '@/assets/aezuir-logo.png';
import { supabase } from '@/integrations/supabase/client';

interface LogoSplashProps {
  onComplete: () => void;
  duration?: number;
}

// Movie-studio-style animation phases
type Phase = 'black' | 'fadeIn' | 'peak' | 'hold' | 'fadeOut' | 'complete';

export const LogoSplash = ({ onComplete, duration = 6000 }: LogoSplashProps) => {
  const [phase, setPhase] = useState<Phase>('black');
  const [audioLoaded, setAudioLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Generate cinematic sound from edge function
    const loadCinematicSound = async () => {
      try {
        console.log('[Logo] Fetching cinematic sound...');
        const { data, error } = await supabase.functions.invoke('generate-cinematic-sound');
        
        if (error) {
          console.error('[Logo] Error generating sound:', error);
          // Continue without sound
          setAudioLoaded(true);
          return;
        }

        if (data?.audioContent) {
          audioRef.current = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
          audioRef.current.volume = 0.7;
          console.log('[Logo] Cinematic sound loaded');
          setAudioLoaded(true);
        } else {
          setAudioLoaded(true);
        }
      } catch (err) {
        console.error('[Logo] Failed to load sound:', err);
        setAudioLoaded(true); // Continue without sound
      }
    };

    loadCinematicSound();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!audioLoaded) return;

    // Phase timing for movie-studio-style cinematic effect
    // Total: ~6 seconds
    const timings = {
      black: 500,      // Dark anticipation
      fadeIn: 1500,    // Logo emerges with sound building
      peak: 1500,      // Full reveal, dramatic hit
      hold: 1000,      // Let it breathe
      fadeOut: 1500,   // Graceful fade to black
    };

    const timers: NodeJS.Timeout[] = [];

    // Phase 1: Black (anticipation) -> Fade In
    timers.push(setTimeout(() => {
      setPhase('fadeIn');
      // Play sound at fade in start
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          console.log('[Logo] Sound autoplay blocked');
        });
      }
    }, timings.black));

    // Phase 2: Fade In -> Peak
    timers.push(setTimeout(() => {
      setPhase('peak');
    }, timings.black + timings.fadeIn));

    // Phase 3: Peak -> Hold
    timers.push(setTimeout(() => {
      setPhase('hold');
    }, timings.black + timings.fadeIn + timings.peak));

    // Phase 4: Hold -> Fade Out
    timers.push(setTimeout(() => {
      setPhase('fadeOut');
      // Start volume fade out
      if (audioRef.current) {
        volumeIntervalRef.current = setInterval(() => {
          if (audioRef.current && audioRef.current.volume > 0.05) {
            audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.05);
          }
        }, 100);
      }
    }, timings.black + timings.fadeIn + timings.peak + timings.hold));

    // Phase 5: Complete
    timers.push(setTimeout(() => {
      setPhase('complete');
      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      onComplete();
    }, timings.black + timings.fadeIn + timings.peak + timings.hold + timings.fadeOut));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [audioLoaded, onComplete]);

  // Calculate opacity and scale based on phase
  const getLogoOpacity = () => {
    switch (phase) {
      case 'black': return 0;
      case 'fadeIn': return 1;
      case 'peak': return 1;
      case 'hold': return 1;
      case 'fadeOut': return 0;
      case 'complete': return 0;
      default: return 0;
    }
  };

  const getLogoScale = () => {
    switch (phase) {
      case 'black': return 0.8;
      case 'fadeIn': return 1;
      case 'peak': return 1.05;
      case 'hold': return 1.05;
      case 'fadeOut': return 1.1;
      case 'complete': return 1.1;
      default: return 0.8;
    }
  };

  const getGlowIntensity = () => {
    switch (phase) {
      case 'black': return 0;
      case 'fadeIn': return 0.5;
      case 'peak': return 1;
      case 'hold': return 0.8;
      case 'fadeOut': return 0;
      case 'complete': return 0;
      default: return 0;
    }
  };

  if (phase === 'complete') return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden",
        "transition-opacity duration-1000"
      )}
      style={{
        backgroundColor: '#000000',
        opacity: phase === 'fadeOut' ? 0 : 1,
      }}
    >
      {/* Deep black background */}
      <div className="absolute inset-0 bg-black" />

      {/* Subtle ambient gradient - only visible during peak */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: phase === 'peak' || phase === 'hold' ? 0.3 : 0,
          background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
        }}
      />

      {/* Primary glow orb behind logo */}
      <div 
        className="absolute w-96 h-96 rounded-full transition-all duration-1000"
        style={{
          opacity: getGlowIntensity() * 0.6,
          transform: `scale(${0.5 + getGlowIntensity() * 0.5})`,
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Secondary pulse ring - only during peak */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full border border-blue-500/20 transition-all duration-500"
        style={{
          opacity: phase === 'peak' ? 0.5 : 0,
          transform: `scale(${phase === 'peak' ? 1.2 : 0.8})`,
        }}
      />

      {/* Logo container with dramatic transitions */}
      <div 
        className="relative z-10 flex flex-col items-center transition-all ease-out"
        style={{
          opacity: getLogoOpacity(),
          transform: `scale(${getLogoScale()})`,
          transitionDuration: '1500ms',
        }}
      >
        {/* Logo glow effect */}
        <div 
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: getGlowIntensity(),
            filter: 'blur(30px)',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, transparent 70%)',
          }}
        />

        {/* Main logo */}
        <img 
          src={aezuirLogo} 
          alt="AEZUIR" 
          className="w-48 h-48 md:w-64 md:h-64 object-contain relative z-10 drop-shadow-2xl"
          style={{
            filter: phase === 'peak' ? 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.5))' : 'none',
          }}
        />
        
        {/* "Powered by AEZUIR" text - appears at peak */}
        <div 
          className="mt-8 flex flex-col items-center gap-2 transition-all duration-700"
          style={{
            opacity: phase === 'peak' || phase === 'hold' ? 1 : 0,
            transform: `translateY(${phase === 'peak' || phase === 'hold' ? 0 : 20}px)`,
          }}
        >
          <span className="text-blue-400/60 text-sm tracking-[0.3em] uppercase font-light">
            Powered by
          </span>
          <span className="text-white text-3xl md:text-4xl font-bold tracking-wider">
            AEZUIR
          </span>
        </div>
      </div>

      {/* Cinematic letterbox bars */}
      <div 
        className="absolute top-0 left-0 right-0 h-16 bg-black transition-transform duration-1000"
        style={{
          transform: `translateY(${phase === 'fadeIn' || phase === 'peak' || phase === 'hold' ? 0 : -64}px)`,
        }}
      />
      <div 
        className="absolute bottom-0 left-0 right-0 h-16 bg-black transition-transform duration-1000"
        style={{
          transform: `translateY(${phase === 'fadeIn' || phase === 'peak' || phase === 'hold' ? 0 : 64}px)`,
        }}
      />

      {/* Vignette effect for cinema feel */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          opacity: phase === 'peak' || phase === 'hold' ? 0.4 : 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%)',
        }}
      />
    </div>
  );
};
