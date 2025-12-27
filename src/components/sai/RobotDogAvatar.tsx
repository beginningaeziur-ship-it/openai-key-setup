import React from 'react';
import { cn } from '@/lib/utils';
import { useSAINarrator } from '@/contexts/SAINarratorContext';
import { EnergyLevel, NeedLevels } from '@/contexts/ServiceDogContext';

type DogState = 'resting' | 'alert' | 'attentive' | 'listening' | 'speaking';

interface RobotDogAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  state?: DogState;
  showBreathing?: boolean;
  energyLevel?: EnergyLevel;
  needLevels?: NeedLevels;
  showNeedIndicators?: boolean;
}

export function RobotDogAvatar({ 
  size = 'md', 
  className,
  state: propState,
  showBreathing = true,
  energyLevel = 'high',
  needLevels,
  showNeedIndicators = false,
}: RobotDogAvatarProps) {
  const { isNarrating, isListening } = useSAINarrator();
  
  // Derive state from narrator context if not explicitly provided
  const state: DogState = propState || (
    isNarrating ? 'speaking' : 
    isListening ? 'listening' : 
    'resting'
  );

  const sizeConfig = {
    sm: { container: 'w-12 h-12', head: 48, ear: 8, eye: 4 },
    md: { container: 'w-20 h-20', head: 80, ear: 12, eye: 6 },
    lg: { container: 'w-28 h-28', head: 112, ear: 16, eye: 8 },
    xl: { container: 'w-40 h-40', head: 160, ear: 22, eye: 12 },
  };

  const config = sizeConfig[size];

  // Energy-based opacity and saturation
  const getEnergyModifier = () => {
    switch (energyLevel) {
      case 'high': return { opacity: 1, saturation: 1, speed: 1 };
      case 'medium': return { opacity: 0.85, saturation: 0.8, speed: 1.2 };
      case 'low': return { opacity: 0.7, saturation: 0.6, speed: 1.5 };
      case 'resting': return { opacity: 0.5, saturation: 0.4, speed: 2 };
    }
  };

  const energyMod = getEnergyModifier();

  // State-based styling with energy consideration
  const getEyeGlow = () => {
    const baseColors = {
      alert: 'hsl(var(--primary))',
      attentive: 'hsl(142 76% 45%)', // Soft green
      listening: 'hsl(200 95% 60%)', // Calm blue
      speaking: 'hsl(45 93% 58%)', // Warm amber
      resting: 'hsl(var(--primary) / 0.6)', // Dimmed for resting
    };
    
    // Dim further based on energy
    if (energyLevel === 'resting' || energyLevel === 'low') {
      return 'hsl(var(--primary) / 0.3)';
    }
    
    return baseColors[state];
  };

  const getEarRotation = () => {
    // Lower ears when low energy
    if (energyLevel === 'resting' || energyLevel === 'low') {
      return { left: 5, right: -5 }; // Droopy ears
    }
    
    switch (state) {
      case 'alert': return { left: -15, right: 15 };
      case 'attentive': return { left: -8, right: 8 };
      case 'listening': return { left: -20, right: 20 };
      default: return { left: 0, right: 0 };
    }
  };

  const earRotation = getEarRotation();

  // Get head tilt based on energy (lower head when tired)
  const getHeadTilt = () => {
    if (energyLevel === 'resting') return 5;
    if (energyLevel === 'low') return 3;
    return 0;
  };

  // Get lowest need for indicator
  const getLowestNeedInfo = () => {
    if (!needLevels) return null;
    
    let lowestNeed: keyof NeedLevels | null = null;
    let lowestValue = 100;
    
    (Object.keys(needLevels) as (keyof NeedLevels)[]).forEach(need => {
      if (needLevels[need] < lowestValue) {
        lowestValue = needLevels[need];
        lowestNeed = need;
      }
    });
    
    if (lowestValue >= 50) return null;
    
    const icons: Record<keyof NeedLevels, string> = {
      food: '🍖',
      water: '💧',
      rest: '😴',
      movement: '🦮',
      attention: '❤️',
    };
    
    return { need: lowestNeed, value: lowestValue, icon: lowestNeed ? icons[lowestNeed] : '' };
  };

  const lowestNeed = getLowestNeedInfo();

  return (
    <div className={cn(
      'relative flex items-center justify-center',
      config.container,
      className
    )}>
      {/* Subtle glow behind for active states */}
      {state !== 'resting' && energyLevel !== 'resting' && (
        <div 
          className="absolute inset-0 rounded-full opacity-30 blur-xl transition-opacity duration-1000"
          style={{ backgroundColor: getEyeGlow() }}
        />
      )}

      <svg 
        viewBox="0 0 100 100" 
        className={cn(
          'w-full h-full transition-all duration-700',
          showBreathing && state === 'resting' && 'animate-[breathe_4s_ease-in-out_infinite]'
        )}
        style={{ 
          opacity: energyMod.opacity,
          filter: `saturate(${energyMod.saturation})`,
          transform: `rotate(${getHeadTilt()}deg)`,
        }}
      >
        <defs>
          {/* Metallic gradient for robot body */}
          <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--muted))" />
            <stop offset="50%" stopColor="hsl(var(--muted-foreground) / 0.3)" />
            <stop offset="100%" stopColor="hsl(var(--muted))" />
          </linearGradient>
          
          {/* Eye glow filter */}
          <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Subtle shadow */}
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Main head shape - rounded rectangle resembling dog face */}
        <g filter="url(#shadow)">
          {/* Head base */}
          <rect 
            x="20" y="25" 
            width="60" height="55" 
            rx="20" ry="20"
            fill="url(#metalGradient)"
            stroke="hsl(var(--border))"
            strokeWidth="1.5"
            className="transition-all duration-500"
          />

          {/* Snout */}
          <rect 
            x="32" y="55" 
            width="36" height="22" 
            rx="11" ry="11"
            fill="hsl(var(--muted))"
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />

          {/* Nose */}
          <ellipse 
            cx="50" cy="62" 
            rx="6" ry="4"
            fill="hsl(var(--foreground) / 0.8)"
            className={cn(
              'transition-all duration-300',
              state === 'attentive' && energyLevel !== 'resting' && 'animate-[pulse_2s_ease-in-out_infinite]'
            )}
          />

          {/* Left ear */}
          <g 
            className="transition-transform duration-500 origin-bottom"
            style={{ transform: `rotate(${earRotation.left}deg)`, transformOrigin: '30px 30px' }}
          >
            <path 
              d="M 22 28 Q 15 10 28 18 L 30 28 Z"
              fill="url(#metalGradient)"
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />
          </g>

          {/* Right ear */}
          <g 
            className="transition-transform duration-500 origin-bottom"
            style={{ transform: `rotate(${earRotation.right}deg)`, transformOrigin: '70px 30px' }}
          >
            <path 
              d="M 78 28 Q 85 10 72 18 L 70 28 Z"
              fill="url(#metalGradient)"
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />
          </g>

          {/* Left eye socket */}
          <ellipse 
            cx="36" cy="42" 
            rx="8" ry="7"
            fill="hsl(var(--background))"
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />

          {/* Right eye socket */}
          <ellipse 
            cx="64" cy="42" 
            rx="8" ry="7"
            fill="hsl(var(--background))"
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />

          {/* Left eye - glowing */}
          <ellipse 
            cx="36" cy="42" 
            rx="5" 
            ry={energyLevel === 'resting' ? 1 : energyLevel === 'low' ? 2 : 4}
            fill={getEyeGlow()}
            filter="url(#eyeGlow)"
            className={cn(
              'transition-all duration-500',
              state === 'speaking' && energyLevel !== 'resting' && 'animate-[pulse_1.5s_ease-in-out_infinite]',
              state === 'listening' && energyLevel !== 'resting' && 'animate-[pulse_2s_ease-in-out_infinite]'
            )}
          >
            {state === 'resting' && energyLevel === 'high' && (
              <animate 
                attributeName="ry" 
                values="4;1;4" 
                dur="4s" 
                repeatCount="indefinite"
                keyTimes="0;0.1;1"
              />
            )}
          </ellipse>

          {/* Right eye - glowing */}
          <ellipse 
            cx="64" cy="42" 
            rx="5" 
            ry={energyLevel === 'resting' ? 1 : energyLevel === 'low' ? 2 : 4}
            fill={getEyeGlow()}
            filter="url(#eyeGlow)"
            className={cn(
              'transition-all duration-500',
              state === 'speaking' && energyLevel !== 'resting' && 'animate-[pulse_1.5s_ease-in-out_infinite]',
              state === 'listening' && energyLevel !== 'resting' && 'animate-[pulse_2s_ease-in-out_infinite]'
            )}
          >
            {state === 'resting' && energyLevel === 'high' && (
              <animate 
                attributeName="ry" 
                values="4;1;4" 
                dur="4s" 
                repeatCount="indefinite"
                keyTimes="0;0.1;1"
              />
            )}
          </ellipse>

          {/* Collar/neck plate */}
          <rect 
            x="35" y="78" 
            width="30" height="8" 
            rx="2"
            fill="hsl(var(--primary) / 0.3)"
            stroke="hsl(var(--primary) / 0.5)"
            strokeWidth="1"
          />

          {/* Status indicator light on collar - color based on energy */}
          <circle 
            cx="50" cy="82" 
            r="2"
            fill={
              energyLevel === 'high' ? 'hsl(142 76% 45%)' :
              energyLevel === 'medium' ? 'hsl(45 93% 58%)' :
              energyLevel === 'low' ? 'hsl(25 95% 53%)' :
              'hsl(0 72% 50%)'
            }
            className={cn(
              energyLevel !== 'resting' && 'animate-[pulse_2s_ease-in-out_infinite]'
            )}
          />

          {/* Panel lines for robotic detail */}
          <line 
            x1="30" y1="35" x2="30" y2="50" 
            stroke="hsl(var(--border))" 
            strokeWidth="0.5" 
            opacity="0.5"
          />
          <line 
            x1="70" y1="35" x2="70" y2="50" 
            stroke="hsl(var(--border))" 
            strokeWidth="0.5" 
            opacity="0.5"
          />
        </g>
      </svg>

      {/* Speaking indicator waves */}
      {state === 'speaking' && energyLevel !== 'resting' && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
          <div className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}

      {/* Listening indicator */}
      {state === 'listening' && energyLevel !== 'resting' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
      )}

      {/* Low energy indicator */}
      {(energyLevel === 'low' || energyLevel === 'resting') && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs opacity-70">
          💤
        </div>
      )}

      {/* Need indicator bubble */}
      {showNeedIndicators && lowestNeed && (
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-xs shadow-lg animate-pulse">
          {lowestNeed.icon}
        </div>
      )}
    </div>
  );
}
