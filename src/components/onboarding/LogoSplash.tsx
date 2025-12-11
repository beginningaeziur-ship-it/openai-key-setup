import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import aezuirLogo from '@/assets/aezuir-logo.png';

interface LogoSplashProps {
  onComplete: () => void;
  duration?: number;
}

// Extended movie-studio-style animation phases
type Phase = 
  | 'black' 
  | 'rumble' 
  | 'emerge' 
  | 'reveal' 
  | 'peak' 
  | 'radiate' 
  | 'text' 
  | 'hold' 
  | 'fadeOut' 
  | 'complete';

export const LogoSplash = ({ onComplete, duration = 20000 }: LogoSplashProps) => {
  const [phase, setPhase] = useState<Phase>('black');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Use a dramatic orchestral hit sound (royalty-free)
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3');
    audioRef.current.volume = 0.8;

    // Phase timing for epic 20-second movie-studio experience
    const timings = {
      black: 1500,      // Deep darkness, anticipation builds
      rumble: 2000,     // Subtle rumble begins, particles appear
      emerge: 2500,     // Logo starts emerging from darkness
      reveal: 3000,     // Full reveal with dramatic lighting
      peak: 3500,       // Maximum intensity, sound climax
      radiate: 2500,    // Light radiates outward
      text: 2000,       // Text appears with gravitas
      hold: 1500,       // Let the moment breathe
      fadeOut: 1500,    // Graceful fade to black
    };

    const timers: NodeJS.Timeout[] = [];
    let cumulativeTime = 0;

    // Phase 1: Black -> Rumble
    cumulativeTime += timings.black;
    timers.push(setTimeout(() => {
      setPhase('rumble');
    }, cumulativeTime));

    // Phase 2: Rumble -> Emerge (play sound)
    cumulativeTime += timings.rumble;
    timers.push(setTimeout(() => {
      setPhase('emerge');
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          console.log('[Logo] Sound autoplay blocked');
        });
      }
    }, cumulativeTime));

    // Phase 3: Emerge -> Reveal
    cumulativeTime += timings.emerge;
    timers.push(setTimeout(() => {
      setPhase('reveal');
    }, cumulativeTime));

    // Phase 4: Reveal -> Peak
    cumulativeTime += timings.reveal;
    timers.push(setTimeout(() => {
      setPhase('peak');
    }, cumulativeTime));

    // Phase 5: Peak -> Radiate
    cumulativeTime += timings.peak;
    timers.push(setTimeout(() => {
      setPhase('radiate');
    }, cumulativeTime));

    // Phase 6: Radiate -> Text
    cumulativeTime += timings.radiate;
    timers.push(setTimeout(() => {
      setPhase('text');
    }, cumulativeTime));

    // Phase 7: Text -> Hold
    cumulativeTime += timings.text;
    timers.push(setTimeout(() => {
      setPhase('hold');
    }, cumulativeTime));

    // Phase 8: Hold -> Fade Out
    cumulativeTime += timings.hold;
    timers.push(setTimeout(() => {
      setPhase('fadeOut');
      // Start volume fade out
      if (audioRef.current) {
        volumeIntervalRef.current = setInterval(() => {
          if (audioRef.current && audioRef.current.volume > 0.05) {
            audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.03);
          }
        }, 50);
      }
    }, cumulativeTime));

    // Phase 9: Complete
    cumulativeTime += timings.fadeOut;
    timers.push(setTimeout(() => {
      setPhase('complete');
      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      onComplete();
    }, cumulativeTime));

    return () => {
      timers.forEach(clearTimeout);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current);
      }
    };
  }, [onComplete]);

  // Dynamic styling based on phase
  const getLogoOpacity = () => {
    switch (phase) {
      case 'black': return 0;
      case 'rumble': return 0.1;
      case 'emerge': return 0.5;
      case 'reveal': return 0.85;
      case 'peak': return 1;
      case 'radiate': return 1;
      case 'text': return 1;
      case 'hold': return 1;
      case 'fadeOut': return 0;
      default: return 0;
    }
  };

  const getLogoScale = () => {
    switch (phase) {
      case 'black': return 0.5;
      case 'rumble': return 0.6;
      case 'emerge': return 0.8;
      case 'reveal': return 0.95;
      case 'peak': return 1.1;
      case 'radiate': return 1.05;
      case 'text': return 1.0;
      case 'hold': return 1.0;
      case 'fadeOut': return 1.15;
      default: return 0.5;
    }
  };

  const getGlowIntensity = () => {
    switch (phase) {
      case 'black': return 0;
      case 'rumble': return 0.1;
      case 'emerge': return 0.3;
      case 'reveal': return 0.6;
      case 'peak': return 1;
      case 'radiate': return 0.9;
      case 'text': return 0.7;
      case 'hold': return 0.6;
      case 'fadeOut': return 0;
      default: return 0;
    }
  };

  const showParticles = ['rumble', 'emerge', 'reveal', 'peak', 'radiate', 'text', 'hold'].includes(phase);
  const showRays = ['reveal', 'peak', 'radiate', 'text', 'hold'].includes(phase);
  const showText = ['text', 'hold'].includes(phase);
  const isPeak = phase === 'peak';
  const isRadiate = phase === 'radiate';

  if (phase === 'complete') return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      )}
      style={{
        backgroundColor: '#000000',
        opacity: phase === 'fadeOut' ? 0 : 1,
        transition: 'opacity 1.5s ease-out',
      }}
    >
      {/* Deep black background */}
      <div className="absolute inset-0 bg-black" />

      {/* Rumble effect - subtle screen shake */}
      <div 
        className="absolute inset-0"
        style={{
          animation: phase === 'rumble' ? 'subtle-shake 0.1s infinite' : 'none',
        }}
      />

      {/* Ambient nebula gradient */}
      <div 
        className="absolute inset-0 transition-opacity duration-2000"
        style={{
          opacity: getGlowIntensity() * 0.4,
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, rgba(59, 130, 246, 0.08) 30%, transparent 70%)',
        }}
      />

      {/* Light rays emanating from center */}
      {showRays && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 origin-center"
              style={{
                width: '3px',
                height: isPeak ? '600px' : isRadiate ? '800px' : '400px',
                background: `linear-gradient(to bottom, transparent, rgba(99, 102, 241, ${0.15 - i * 0.01}), transparent)`,
                transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                opacity: getGlowIntensity() * 0.6,
                transition: 'all 1s ease-out',
              }}
            />
          ))}
        </div>
      )}

      {/* Outer glow ring - expands during peak */}
      <div 
        className="absolute rounded-full transition-all duration-1000"
        style={{
          width: isPeak ? '800px' : isRadiate ? '1000px' : '200px',
          height: isPeak ? '800px' : isRadiate ? '1000px' : '200px',
          opacity: isPeak ? 0.4 : isRadiate ? 0.2 : 0,
          background: 'radial-gradient(circle, transparent 30%, rgba(99, 102, 241, 0.3) 50%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Primary glow orb */}
      <div 
        className="absolute rounded-full transition-all duration-1500"
        style={{
          width: `${200 + getGlowIntensity() * 500}px`,
          height: `${200 + getGlowIntensity() * 500}px`,
          opacity: getGlowIntensity() * 0.5,
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, rgba(59, 130, 246, 0.2) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Secondary pulse rings */}
      {isPeak && (
        <>
          <div 
            className="absolute w-[400px] h-[400px] rounded-full border-2 border-blue-400/30"
            style={{ animation: 'ring-pulse 2s ease-out infinite' }}
          />
          <div 
            className="absolute w-[500px] h-[500px] rounded-full border border-indigo-400/20"
            style={{ animation: 'ring-pulse 2s ease-out infinite 0.3s' }}
          />
          <div 
            className="absolute w-[600px] h-[600px] rounded-full border border-purple-400/10"
            style={{ animation: 'ring-pulse 2s ease-out infinite 0.6s' }}
          />
        </>
      )}

      {/* Floating particles */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                background: `rgba(${150 + Math.random() * 100}, ${150 + Math.random() * 100}, 255, ${0.3 + Math.random() * 0.4})`,
                animation: `float-particle ${4 + Math.random() * 6}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: getGlowIntensity(),
              }}
            />
          ))}
        </div>
      )}

      {/* Logo container */}
      <div 
        className="relative z-10 flex flex-col items-center"
        style={{
          opacity: getLogoOpacity(),
          transform: `scale(${getLogoScale()})`,
          transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Logo inner glow */}
        <div 
          className="absolute inset-0 -m-16"
          style={{
            opacity: getGlowIntensity(),
            filter: 'blur(40px)',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.6) 0%, transparent 60%)',
            transition: 'opacity 1s ease-out',
          }}
        />

        {/* Main logo */}
        <img 
          src={aezuirLogo} 
          alt="AEZUIR" 
          className="w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 object-contain relative z-10"
          style={{
            filter: isPeak 
              ? 'drop-shadow(0 0 60px rgba(99, 102, 241, 0.8)) drop-shadow(0 0 120px rgba(59, 130, 246, 0.5))'
              : `drop-shadow(0 0 ${20 + getGlowIntensity() * 40}px rgba(99, 102, 241, ${getGlowIntensity() * 0.6}))`,
            transition: 'filter 1s ease-out',
          }}
        />
        
        {/* "Powered by AEZUIR" text */}
        <div 
          className="mt-12 flex flex-col items-center gap-3 transition-all duration-1000"
          style={{
            opacity: showText ? 1 : 0,
            transform: `translateY(${showText ? 0 : 30}px)`,
          }}
        >
          <span 
            className="text-blue-400/70 text-sm md:text-base tracking-[0.4em] uppercase font-light"
            style={{
              textShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
            }}
          >
            Powered by
          </span>
          <span 
            className="text-white text-4xl md:text-5xl lg:text-6xl font-bold tracking-[0.15em]"
            style={{
              textShadow: '0 0 40px rgba(255, 255, 255, 0.3), 0 0 80px rgba(99, 102, 241, 0.4)',
            }}
          >
            AEZUIR
          </span>
        </div>
      </div>

      {/* Cinematic letterbox bars */}
      <div 
        className="absolute top-0 left-0 right-0 bg-black transition-all duration-1500"
        style={{
          height: phase === 'fadeOut' ? 0 : '10vh',
          transform: `translateY(${phase === 'black' ? '-100%' : 0})`,
        }}
      />
      <div 
        className="absolute bottom-0 left-0 right-0 bg-black transition-all duration-1500"
        style={{
          height: phase === 'fadeOut' ? 0 : '10vh',
          transform: `translateY(${phase === 'black' ? '100%' : 0})`,
        }}
      />

      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          opacity: getGlowIntensity() * 0.5,
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.9) 100%)',
        }}
      />

      {/* Custom animations */}
      <style>{`
        @keyframes ring-pulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-30px) translateX(15px); opacity: 0.7; }
          50% { transform: translateY(-15px) translateX(-10px); opacity: 0.5; }
          75% { transform: translateY(-40px) translateX(20px); opacity: 0.6; }
        }
        @keyframes subtle-shake {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-1px, 1px); }
          50% { transform: translate(1px, -1px); }
          75% { transform: translate(-1px, -1px); }
        }
      `}</style>
    </div>
  );
};
