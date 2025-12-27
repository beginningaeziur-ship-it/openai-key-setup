import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import aezuirLogo from '@/assets/aezuir-logo.png';
import cinematicRoar from '@/assets/cinematic-roar.mp3';

interface LogoSplashProps {
  onComplete: () => void;
}

/**
 * LogoSplash - Logo ONLY with cinematic music
 * 
 * HARD RULES:
 * - Logo shows alone for 5-6 seconds with music
 * - Logo must fully unmount before SAI mounts
 * - No logo + SAI overlap, ever
 * - Cinematic fade in with music
 */
export const LogoSplash = ({ onComplete }: LogoSplashProps) => {
  const [phase, setPhase] = useState<'fade-in' | 'visible' | 'fade-out'>('fade-in');
  const [isVisible, setIsVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const failsafeRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create and play cinematic audio
    audioRef.current = new Audio(cinematicRoar);
    audioRef.current.volume = 0;
    
    // Fade in audio
    const fadeInAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
        let vol = 0;
        const fadeInterval = setInterval(() => {
          vol += 0.05;
          if (audioRef.current && vol <= 0.6) {
            audioRef.current.volume = vol;
          } else {
            clearInterval(fadeInterval);
          }
        }, 100);
      }
    };

    // Phase timing
    // 0-500ms: Fade in
    // 500-5000ms: Visible with music
    // 5000-6000ms: Fade out
    
    fadeInAudio();
    
    const fadeInTimer = setTimeout(() => {
      setPhase('visible');
    }, 500);

    const fadeOutTimer = setTimeout(() => {
      setPhase('fade-out');
      // Fade out audio
      if (audioRef.current) {
        let vol = audioRef.current.volume;
        const fadeInterval = setInterval(() => {
          vol -= 0.05;
          if (audioRef.current && vol >= 0) {
            audioRef.current.volume = Math.max(0, vol);
          } else {
            clearInterval(fadeInterval);
          }
        }, 50);
      }
    }, 5000);

    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      onComplete();
    }, 6000);

    // FAILSAFE: Complete in 7 seconds max no matter what
    failsafeRef.current = setTimeout(() => {
      setIsVisible(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      onComplete();
    }, 7000);

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
        "fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-1000",
        phase === 'fade-in' && "opacity-0",
        phase === 'visible' && "opacity-100",
        phase === 'fade-out' && "opacity-0"
      )}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Cinematic glow pulse */}
        <div 
          className={cn(
            "absolute rounded-full transition-all duration-[2000ms]",
            phase === 'visible' ? "opacity-100 scale-100" : "opacity-0 scale-50"
          )}
          style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.1) 40%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        
        {/* Logo with cinematic reveal */}
        <img 
          src={aezuirLogo} 
          alt="AEZUIR" 
          className={cn(
            "w-40 h-40 md:w-52 md:h-52 object-contain relative z-10 transition-all duration-[1500ms]",
            phase === 'fade-in' && "opacity-0 scale-90",
            phase === 'visible' && "opacity-100 scale-100",
            phase === 'fade-out' && "opacity-0 scale-110"
          )}
          style={{
            filter: 'drop-shadow(0 0 40px rgba(99, 102, 241, 0.5))',
          }}
        />
        
        {/* Brand text with staggered reveal */}
        <span 
          className={cn(
            "text-white/70 text-lg tracking-[0.4em] uppercase font-light transition-all duration-1000 delay-300",
            phase === 'fade-in' && "opacity-0 translate-y-4",
            phase === 'visible' && "opacity-100 translate-y-0",
            phase === 'fade-out' && "opacity-0 translate-y-[-4px]"
          )}
        >
          AEZUIR
        </span>
      </div>
    </div>
  );
};
