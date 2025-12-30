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

/**
 * RobotDogAvatar - Cute dalmatian-style robot dog face
 * 
 * Head-only view for smaller displays and avatars
 * Features: animated mouth when speaking, dalmatian spots
 */
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
  
  const state: DogState = propState || (
    isNarrating ? 'speaking' : 
    isListening ? 'listening' : 
    'resting'
  );

  const sizeConfig = {
    sm: { container: 'w-12 h-12', viewBox: '0 0 100 100' },
    md: { container: 'w-20 h-20', viewBox: '0 0 100 100' },
    lg: { container: 'w-28 h-28', viewBox: '0 0 100 100' },
    xl: { container: 'w-40 h-40', viewBox: '0 0 100 100' },
  };

  const config = sizeConfig[size];

  const getEnergyModifier = () => {
    switch (energyLevel) {
      case 'high': return { opacity: 1, saturation: 1, speed: 1 };
      case 'medium': return { opacity: 0.85, saturation: 0.8, speed: 1.2 };
      case 'low': return { opacity: 0.7, saturation: 0.6, speed: 1.5 };
      case 'resting': return { opacity: 0.5, saturation: 0.4, speed: 2 };
    }
  };

  const energyMod = getEnergyModifier();

  const getEyeColor = () => {
    if (energyLevel === 'resting' || energyLevel === 'low') {
      return 'hsl(25 40% 25%)';
    }
    
    const colors = {
      alert: 'hsl(25 70% 35%)',
      attentive: 'hsl(25 60% 35%)',
      listening: 'hsl(25 70% 40%)',
      speaking: 'hsl(25 80% 45%)',
      resting: 'hsl(25 50% 30%)',
    };
    return colors[state];
  };

  const getEarRotation = () => {
    if (energyLevel === 'resting' || energyLevel === 'low') {
      return { left: 5, right: -5 };
    }
    
    switch (state) {
      case 'alert': return { left: -10, right: 10 };
      case 'attentive': return { left: -5, right: 5 };
      case 'listening': return { left: -15, right: 15 };
      default: return { left: 0, right: 0 };
    }
  };

  const earRotation = getEarRotation();

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
      <svg 
        viewBox={config.viewBox}
        className={cn(
          'w-full h-full transition-all duration-700',
          showBreathing && state === 'resting' && 'animate-[breathe_4s_ease-in-out_infinite]'
        )}
        style={{ 
          opacity: energyMod.opacity,
          filter: `saturate(${energyMod.saturation})`,
        }}
      >
        <defs>
          <linearGradient id="avatarDalmatianBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5f0e8" />
            <stop offset="50%" stopColor="#ebe6de" />
            <stop offset="100%" stopColor="#f5f0e8" />
          </linearGradient>

          <filter id="avatarSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
          </filter>
        </defs>

        <g filter="url(#avatarSoftShadow)">
          {/* Head */}
          <ellipse 
            cx="50" cy="50" 
            rx="38" ry="35"
            fill="url(#avatarDalmatianBody)"
            stroke="#d4cfc5"
            strokeWidth="2"
          />

          {/* Head spots */}
          <ellipse cx="28" cy="35" rx="6" ry="5" fill="#3d3d3d" />
          <ellipse cx="75" cy="32" rx="5" ry="6" fill="#3d3d3d" />
          <circle cx="40" cy="22" r="4" fill="#3d3d3d" />
          <ellipse cx="68" cy="65" rx="4" ry="3" fill="#3d3d3d" />

          {/* Left ear */}
          <g 
            className="transition-transform duration-500"
            style={{ transform: `rotate(${earRotation.left}deg)`, transformOrigin: '25px 30px' }}
          >
            <ellipse 
              cx="15" cy="42" 
              rx="14" ry="22"
              fill="url(#avatarDalmatianBody)"
              stroke="#d4cfc5"
              strokeWidth="1.5"
            />
            <ellipse cx="12" cy="38" rx="5" ry="6" fill="#3d3d3d" />
            <circle cx="18" cy="50" r="3" fill="#3d3d3d" />
          </g>

          {/* Right ear */}
          <g 
            className="transition-transform duration-500"
            style={{ transform: `rotate(${earRotation.right}deg)`, transformOrigin: '75px 30px' }}
          >
            <ellipse 
              cx="85" cy="42" 
              rx="14" ry="22"
              fill="url(#avatarDalmatianBody)"
              stroke="#d4cfc5"
              strokeWidth="1.5"
            />
            <ellipse cx="88" cy="36" rx="6" ry="5" fill="#3d3d3d" />
            <circle cx="82" cy="48" r="3" fill="#3d3d3d" />
          </g>

          {/* Snout */}
          <ellipse 
            cx="50" cy="62" 
            rx="16" ry="12"
            fill="url(#avatarDalmatianBody)"
            stroke="#d4cfc5"
            strokeWidth="1.5"
          />

          {/* Nose */}
          <ellipse cx="50" cy="56" rx="7" ry="5" fill="#2d2d2d" />
          <ellipse cx="48" cy="54" rx="2" ry="1" fill="#4d4d4d" />

          {/* Mouth - static smile */}
          <path 
            d="M 40 68 Q 50 73 60 68"
            fill="none"
            stroke="#2d2d2d"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Left eye */}
          <ellipse cx="36" cy="44" rx="10" ry="11" fill="#ffffff" stroke="#d4cfc5" strokeWidth="1" />
          <ellipse 
            cx="36" cy="45" 
            rx="6" ry="7"
            fill={getEyeColor()}
            className={cn(
              'transition-all duration-500',
              state === 'speaking' && energyLevel !== 'resting' && 'animate-[pulse_1.5s_ease-in-out_infinite]'
            )}
          />
          <circle cx="34" cy="42" r="3" fill="#ffffff" />
          <circle cx="38" cy="47" r="1.5" fill="#ffffff" opacity="0.6" />

          {/* Right eye */}
          <ellipse cx="64" cy="44" rx="10" ry="11" fill="#ffffff" stroke="#d4cfc5" strokeWidth="1" />
          <ellipse 
            cx="64" cy="45" 
            rx="6" ry="7"
            fill={getEyeColor()}
            className={cn(
              'transition-all duration-500',
              state === 'speaking' && energyLevel !== 'resting' && 'animate-[pulse_1.5s_ease-in-out_infinite]'
            )}
          />
          <circle cx="62" cy="42" r="3" fill="#ffffff" />
          <circle cx="66" cy="47" r="1.5" fill="#ffffff" opacity="0.6" />

          {/* Sleepy eyes when resting/low energy */}
          {(energyLevel === 'resting' || energyLevel === 'low') && (
            <>
              <line x1="26" y1="44" x2="46" y2="44" stroke="#d4cfc5" strokeWidth="3" strokeLinecap="round" />
              <line x1="54" y1="44" x2="74" y2="44" stroke="#d4cfc5" strokeWidth="3" strokeLinecap="round" />
            </>
          )}
        </g>

        <style>
          {`
            @keyframes mouthMove {
              0%, 100% { transform: scaleY(1); }
              50% { transform: scaleY(1.3); }
            }
          `}
        </style>
      </svg>

      {/* Speaking indicator */}
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

      {/* Need indicator */}
      {showNeedIndicators && lowestNeed && (
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-xs shadow-lg animate-pulse">
          {lowestNeed.icon}
        </div>
      )}
    </div>
  );
}
