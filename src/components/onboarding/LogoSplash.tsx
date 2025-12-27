import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import aezuirLogo from '@/assets/aezuir-logo.png';

interface LogoSplashProps {
  onComplete: () => void;
}

/**
 * LogoSplash - Logo ONLY, no SAI
 * 
 * HARD RULES:
 * - Logo shows alone for 2-3 seconds
 * - Logo must fully unmount before SAI mounts
 * - No logo + SAI overlap, ever
 * - Logo is NOT part of the main layout tree
 */
export const LogoSplash = ({ onComplete }: LogoSplashProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const failsafeRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // FAILSAFE: Complete in 3 seconds max no matter what
    failsafeRef.current = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 3000);

    // Normal flow: Show logo for 2.5 seconds, then exit
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(exitTimer);
      if (failsafeRef.current) {
        clearTimeout(failsafeRef.current);
      }
    };
  }, [onComplete]);

  // Once not visible, return null immediately
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      {/* Logo ONLY - no SAI here */}
      <div className="flex flex-col items-center gap-6">
        {/* Subtle glow */}
        <div 
          className="absolute rounded-full animate-pulse"
          style={{
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        
        {/* Logo */}
        <img 
          src={aezuirLogo} 
          alt="AEZUIR" 
          className="w-32 h-32 md:w-40 md:h-40 object-contain relative z-10 animate-fade-in"
          style={{
            filter: 'drop-shadow(0 0 30px rgba(99, 102, 241, 0.4))',
          }}
        />
        
        <span className="text-white/60 text-sm tracking-[0.3em] uppercase">
          AEZUIR
        </span>
      </div>
    </div>
  );
};
