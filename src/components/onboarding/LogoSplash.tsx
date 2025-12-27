import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import aezuirLogo from '@/assets/aezuir-logo.png';
import { RobotDogAvatar } from '@/components/sai/RobotDogAvatar';

interface LogoSplashProps {
  onComplete: () => void;
}

/**
 * LogoSplash - Max 3 second transition, not a loading state
 * 
 * Rules from UI Spec:
 * - Logo animation plays once, max 2-3 seconds
 * - Logo must always resolve into Sai visible
 * - Failsafe: If anything takes too long → Sai appears anyway
 * - The logo is not a state. The logo is a transition.
 */
export const LogoSplash = ({ onComplete }: LogoSplashProps) => {
  const [phase, setPhase] = useState<'logo' | 'sai-reveal' | 'complete'>('logo');
  const failsafeRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // FAILSAFE: No matter what, complete in 3.5 seconds max
    failsafeRef.current = setTimeout(() => {
      setPhase('complete');
      onComplete();
    }, 3500);

    // Phase 1: Show logo for 1.5 seconds
    const logoTimer = setTimeout(() => {
      setPhase('sai-reveal');
    }, 1500);

    // Phase 2: Show Sai reveal for 1.5 seconds, then complete
    const completeTimer = setTimeout(() => {
      setPhase('complete');
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(completeTimer);
      if (failsafeRef.current) {
        clearTimeout(failsafeRef.current);
      }
    };
  }, [onComplete]);

  if (phase === 'complete') return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      {/* Logo phase */}
      <div 
        className={cn(
          "flex flex-col items-center gap-6 transition-all duration-700",
          phase === 'logo' ? "opacity-100 scale-100" : "opacity-0 scale-90"
        )}
      >
        {/* Subtle glow */}
        <div 
          className="absolute rounded-full"
          style={{
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        
        {/* Logo */}
        <img 
          src={aezuirLogo} 
          alt="AEZUIR" 
          className="w-32 h-32 md:w-40 md:h-40 object-contain relative z-10"
          style={{
            filter: 'drop-shadow(0 0 30px rgba(99, 102, 241, 0.4))',
          }}
        />
        
        <span className="text-white/60 text-sm tracking-[0.3em] uppercase">
          AEZUIR
        </span>
      </div>

      {/* Sai reveal phase - Sai appears as logo fades */}
      <div 
        className={cn(
          "absolute flex flex-col items-center gap-4 transition-all duration-700",
          phase === 'sai-reveal' ? "opacity-100 scale-100" : "opacity-0 scale-110"
        )}
      >
        <RobotDogAvatar 
          size="xl" 
          state="alert" 
          energyLevel="high"
          showBreathing={false}
        />
        <span className="text-white/80 text-lg font-light tracking-wide">
          SAI
        </span>
      </div>
    </div>
  );
};
