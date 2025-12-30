import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import aezuirLogo from '@/assets/aezuir-logo.png';
import cinematicRoar from '@/assets/cinematic-roar.mp3';

interface LogoSplashProps {
  onComplete: () => void;
}

/**
 * LogoSplash - Cinematic Logo Reveal (30 seconds)
 * 
 * HARD RULES:
 * - Logo shows alone for 30 seconds with cinematic music fade-in
 * - Logo must fully unmount before SAI mounts
 * - No logo + SAI overlap, ever
 * - Music fades in over 3 seconds, plays throughout, fades out at end
 */
export const LogoSplash = ({ onComplete }: LogoSplashProps) => {
  const [phase, setPhase] = useState<'fade-in' | 'visible' | 'fade-out'>('fade-in');
  const [isVisible, setIsVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const failsafeRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio(cinematicRoar);
    audioRef.current.volume = 0;
    audioRef.current.loop = true; // Loop if audio is shorter than 30 seconds
    
    // Fade in audio over 3 seconds (0 to 0.6 volume)
    const fadeInAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          console.log('Audio autoplay blocked');
        });
        
        let vol = 0;
        const targetVol = 0.6;
        const fadeInDuration = 3000; // 3 seconds
        const stepTime = 50;
        const stepIncrease = (targetVol / fadeInDuration) * stepTime;
        
        const fadeInterval = setInterval(() => {
          vol += stepIncrease;
          if (audioRef.current && vol <= targetVol) {
            audioRef.current.volume = Math.min(vol, targetVol);
          } else {
            clearInterval(fadeInterval);
          }
        }, stepTime);
      }
    };

    // Fade out audio over 2 seconds
    const fadeOutAudio = () => {
      if (audioRef.current) {
        let vol = audioRef.current.volume;
        const fadeOutDuration = 2000;
        const stepTime = 50;
        const stepDecrease = (vol / fadeOutDuration) * stepTime;
        
        const fadeInterval = setInterval(() => {
          vol -= stepDecrease;
          if (audioRef.current && vol >= 0) {
            audioRef.current.volume = Math.max(0, vol);
          } else {
            clearInterval(fadeInterval);
            if (audioRef.current) {
              audioRef.current.pause();
            }
          }
        }, stepTime);
      }
    };

    // Timeline:
    // 0-2s: Fade in
    // 2-28s: Visible with music
    // 28-30s: Fade out
    
    fadeInAudio();
    
    // Phase: fade-in → visible (after 2 seconds)
    const fadeInTimer = setTimeout(() => {
      setPhase('visible');
    }, 2000);

    // Phase: visible → fade-out (at 28 seconds)
    const fadeOutTimer = setTimeout(() => {
      setPhase('fade-out');
      fadeOutAudio();
    }, 28000);

    // Complete and unmount (at 30 seconds)
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      onComplete();
    }, 30000);

    // FAILSAFE: Complete in 32 seconds max no matter what
    failsafeRef.current = setTimeout(() => {
      setIsVisible(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      onComplete();
    }, 32000);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
      if (failsafeRef.current) {
        clearTimeout(failsafeRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-[2000ms]",
        phase === 'fade-in' && "opacity-0",
        phase === 'visible' && "opacity-100",
        phase === 'fade-out' && "opacity-0"
      )}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Cinematic glow pulse - grows during visible phase */}
        <div 
          className={cn(
            "absolute rounded-full transition-all duration-[4000ms]",
            phase === 'fade-in' && "opacity-0 scale-50",
            phase === 'visible' && "opacity-100 scale-100",
            phase === 'fade-out' && "opacity-0 scale-150"
          )}
          style={{
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0.15) 30%, rgba(99, 102, 241, 0.05) 60%, transparent 80%)',
            filter: 'blur(80px)',
          }}
        />
        
        {/* Secondary ambient glow */}
        <div 
          className={cn(
            "absolute rounded-full transition-all duration-[6000ms] delay-500",
            phase === 'fade-in' && "opacity-0 scale-75",
            phase === 'visible' && "opacity-60 scale-110",
            phase === 'fade-out' && "opacity-0 scale-125"
          )}
          style={{
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        
        {/* Logo with cinematic reveal */}
        <img 
          src={aezuirLogo} 
          alt="AEZUIR" 
          className={cn(
            "w-48 h-48 md:w-64 md:h-64 object-contain relative z-10 transition-all duration-[3000ms]",
            phase === 'fade-in' && "opacity-0 scale-75",
            phase === 'visible' && "opacity-100 scale-100",
            phase === 'fade-out' && "opacity-0 scale-110"
          )}
          style={{
            filter: 'drop-shadow(0 0 60px rgba(99, 102, 241, 0.6))',
          }}
        />
        
        {/* Brand text with staggered reveal */}
        <span 
          className={cn(
            "text-white/80 text-xl md:text-2xl tracking-[0.5em] uppercase font-light transition-all duration-[2000ms] delay-1000",
            phase === 'fade-in' && "opacity-0 translate-y-8",
            phase === 'visible' && "opacity-100 translate-y-0",
            phase === 'fade-out' && "opacity-0 translate-y-[-8px]"
          )}
        >
          AEZUIR
        </span>
        
        {/* Subtle tagline */}
        <span 
          className={cn(
            "text-white/40 text-sm tracking-widest transition-all duration-[2000ms] delay-[2000ms]",
            phase === 'fade-in' && "opacity-0",
            phase === 'visible' && "opacity-100",
            phase === 'fade-out' && "opacity-0"
          )}
        >
          Your companion awaits
        </span>
      </div>
    </div>
  );
};
