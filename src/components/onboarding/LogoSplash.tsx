import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import aezuirLogo from '@/assets/aezuir-logo.png';

interface LogoSplashProps {
  onComplete: () => void;
  duration?: number;
}

export const LogoSplash: React.FC<LogoSplashProps> = ({ 
  onComplete, 
  duration = 3000 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Start fade out before completion
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, duration - 800);

    // Complete after full duration
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center",
        "bg-gradient-to-b from-[#0a0a12] via-[#0d0d1a] to-[#0a0a12]",
        "transition-opacity duration-800",
        isFading ? "opacity-0" : "opacity-100"
      )}
    >
      {/* Ambient glow behind logo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]",
            "transition-all duration-1000",
            isFading ? "scale-150 opacity-0" : "scale-100 opacity-100"
          )} 
        />
      </div>

      {/* Logo */}
      <div 
        className={cn(
          "relative flex flex-col items-center gap-6",
          "transition-all duration-1000 delay-200",
          isFading ? "scale-110 opacity-0" : "scale-100 opacity-100 animate-fade-in"
        )}
      >
        <img 
          src={aezuirLogo} 
          alt="Aezuir" 
          className={cn(
            "w-32 h-32 md:w-40 md:h-40 object-contain",
            "drop-shadow-[0_0_30px_rgba(var(--primary),0.3)]"
          )}
        />
        
        {/* Powered by text */}
        <div className="text-center space-y-1 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <p className="text-xs text-muted-foreground/60 uppercase tracking-[0.3em]">
            Powered by
          </p>
          <p className="text-lg font-light text-foreground/80 tracking-wider">
            Aezuir
          </p>
        </div>
      </div>

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "absolute w-1 h-1 bg-primary/20 rounded-full",
            "animate-float"
          )}
          style={{
            left: `${20 + i * 10}%`,
            top: `${30 + (i % 3) * 20}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${4 + i * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
};
