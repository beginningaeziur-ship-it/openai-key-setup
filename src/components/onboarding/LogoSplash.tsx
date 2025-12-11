import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import aezuirLogo from '@/assets/aezuir-logo.png';

interface LogoSplashProps {
  onComplete: () => void;
  duration?: number;
}

export const LogoSplash: React.FC<LogoSplashProps> = ({ 
  onComplete, 
  duration = 4500 
}) => {
  const [phase, setPhase] = useState<'initial' | 'reveal' | 'glow' | 'text' | 'fade'>('initial');
  const [isVisible, setIsVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create and play ambient intro sound
    audioRef.current = new Audio();
    audioRef.current.volume = 0.3;
    
    // Use a gentle chime/ambient sound URL (royalty-free)
    audioRef.current.src = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';
    
    // Play sound with user interaction fallback
    const playSound = () => {
      audioRef.current?.play().catch(() => {
        // Sound blocked - continue silently
      });
    };

    // Phase timing for cinematic effect
    const timers: NodeJS.Timeout[] = [];

    // Initial delay, then reveal
    timers.push(setTimeout(() => {
      setPhase('reveal');
      playSound();
    }, 300));

    // Glow phase
    timers.push(setTimeout(() => {
      setPhase('glow');
    }, 1200));

    // Text reveal
    timers.push(setTimeout(() => {
      setPhase('text');
    }, 2000));

    // Fade out
    timers.push(setTimeout(() => {
      setPhase('fade');
    }, duration - 1000));

    // Complete
    timers.push(setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, duration));

    return () => {
      timers.forEach(clearTimeout);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden",
        "bg-[#050508]",
        "transition-opacity duration-1000",
        phase === 'fade' ? "opacity-0" : "opacity-100"
      )}
    >
      {/* Deep ambient gradient background */}
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-2000",
          phase !== 'initial' ? "opacity-100" : "opacity-0"
        )}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.08) 0%, rgba(5, 5, 8, 0) 70%)'
        }}
      />

      {/* Cinematic light rays */}
      <div className={cn(
        "absolute inset-0 overflow-hidden transition-opacity duration-1500",
        phase === 'glow' || phase === 'text' || phase === 'fade' ? "opacity-100" : "opacity-0"
      )}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 origin-center"
            style={{
              width: '2px',
              height: '400px',
              background: `linear-gradient(to bottom, transparent, rgba(99, 102, 241, ${0.1 - i * 0.015}), transparent)`,
              transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
              animation: 'ray-pulse 3s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* Primary glow orb */}
      <div 
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "rounded-full transition-all duration-2000 ease-out",
          phase === 'initial' ? "w-0 h-0 opacity-0" :
          phase === 'reveal' ? "w-[200px] h-[200px] opacity-40" :
          phase === 'glow' || phase === 'text' ? "w-[600px] h-[600px] opacity-30" :
          "w-[800px] h-[800px] opacity-0"
        )}
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(99, 102, 241, 0.1) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Secondary pulse ring */}
      <div 
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "rounded-full border border-primary/20 transition-all duration-1500",
          phase === 'glow' || phase === 'text' ? "w-[300px] h-[300px] opacity-100" : "w-0 h-0 opacity-0"
        )}
        style={{
          animation: phase === 'glow' || phase === 'text' ? 'ring-expand 2s ease-out infinite' : 'none',
        }}
      />

      {/* Logo container */}
      <div 
        className={cn(
          "relative z-10 flex flex-col items-center gap-8 transition-all duration-1000",
          phase === 'fade' ? "scale-110 opacity-0" : "scale-100 opacity-100"
        )}
      >
        {/* Logo with cinematic entrance */}
        <div 
          className={cn(
            "relative transition-all duration-1000 ease-out",
            phase === 'initial' ? "scale-50 opacity-0 blur-lg" :
            phase === 'reveal' ? "scale-100 opacity-100 blur-0" :
            "scale-100 opacity-100 blur-0"
          )}
        >
          {/* Logo glow effect */}
          <div 
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              phase === 'glow' || phase === 'text' ? "opacity-100" : "opacity-0"
            )}
            style={{
              background: `radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, transparent 70%)`,
              filter: 'blur(40px)',
              transform: 'scale(1.5)',
            }}
          />
          
          <img 
            src={aezuirLogo} 
            alt="Aezuir" 
            className={cn(
              "relative w-36 h-36 md:w-44 md:h-44 object-contain",
              phase === 'glow' || phase === 'text' ? "drop-shadow-[0_0_50px_rgba(99,102,241,0.5)]" : ""
            )}
          />
        </div>
        
        {/* Text reveal with stagger */}
        <div 
          className={cn(
            "text-center space-y-2 transition-all duration-700",
            phase === 'text' || phase === 'fade' ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <p 
            className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.4em] font-light"
            style={{ transitionDelay: phase === 'text' ? '0.2s' : '0s' }}
          >
            Powered by
          </p>
          <p 
            className={cn(
              "text-2xl font-extralight tracking-[0.2em] transition-all duration-700",
              "bg-gradient-to-r from-foreground/70 via-foreground/90 to-foreground/70 bg-clip-text text-transparent"
            )}
            style={{ transitionDelay: phase === 'text' ? '0.4s' : '0s' }}
          >
            AEZUIR
          </p>
        </div>
      </div>

      {/* Floating particles */}
      <div className={cn(
        "absolute inset-0 pointer-events-none transition-opacity duration-1000",
        phase === 'glow' || phase === 'text' ? "opacity-100" : "opacity-0"
      )}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/30"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animation: `float-particle ${5 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Cinematic letterbox bars */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-16 bg-black transition-all duration-1000",
        phase === 'fade' ? "h-0" : "h-16"
      )} />
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-16 bg-black transition-all duration-1000",
        phase === 'fade' ? "h-0" : "h-16"
      )} />

      {/* Inline styles for custom animations */}
      <style>{`
        @keyframes ray-pulse {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) rotate(var(--rotation)) scaleY(1); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) rotate(var(--rotation)) scaleY(1.1); }
        }
        @keyframes ring-expand {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-10px) translateX(-5px); opacity: 0.4; }
          75% { transform: translateY(-30px) translateX(15px); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
