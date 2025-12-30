import React from 'react';
import { cn } from '@/lib/utils';
import { useSAINarrator } from '@/contexts/SAINarratorContext';

type DogState = 'resting' | 'alert' | 'attentive' | 'listening' | 'speaking';

interface FullBodySAIProps {
  size?: 'md' | 'lg' | 'xl';
  className?: string;
  state?: DogState;
  showBreathing?: boolean;
}

/**
 * FullBodySAI - Complete robot service dog illustration
 * 
 * Full-bodied view showing sitting robot dog
 * Used in waiting room and exit screens
 */
export function FullBodySAI({ 
  size = 'lg', 
  className,
  state: propState,
  showBreathing = true,
}: FullBodySAIProps) {
  const { isNarrating, isListening } = useSAINarrator();
  
  const state: DogState = propState || (
    isNarrating ? 'speaking' : 
    isListening ? 'listening' : 
    'attentive'
  );

  const sizeConfig = {
    md: 'w-32 h-40',
    lg: 'w-48 h-60',
    xl: 'w-64 h-80',
  };

  const getEyeGlow = () => {
    const colors = {
      alert: 'hsl(var(--primary))',
      attentive: 'hsl(142 76% 45%)',
      listening: 'hsl(200 95% 60%)',
      speaking: 'hsl(45 93% 58%)',
      resting: 'hsl(var(--primary) / 0.6)',
    };
    return colors[state];
  };

  const getEarRotation = () => {
    switch (state) {
      case 'alert': return { left: -15, right: 15 };
      case 'attentive': return { left: -8, right: 8 };
      case 'listening': return { left: -20, right: 20 };
      case 'speaking': return { left: -5, right: 5 };
      default: return { left: 0, right: 0 };
    }
  };

  const earRotation = getEarRotation();

  return (
    <div className={cn(
      'relative flex items-center justify-center',
      sizeConfig[size],
      className
    )}>
      {/* Subtle glow behind */}
      {state !== 'resting' && (
        <div 
          className="absolute inset-0 rounded-full opacity-20 blur-2xl transition-opacity duration-1000"
          style={{ backgroundColor: getEyeGlow() }}
        />
      )}

      <svg 
        viewBox="0 0 100 130" 
        className={cn(
          'w-full h-full transition-all duration-700',
          showBreathing && state === 'resting' && 'animate-[breathe_4s_ease-in-out_infinite]'
        )}
      >
        <defs>
          <linearGradient id="bodyMetalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--muted))" />
            <stop offset="50%" stopColor="hsl(var(--muted-foreground) / 0.3)" />
            <stop offset="100%" stopColor="hsl(var(--muted))" />
          </linearGradient>
          
          <filter id="bodyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="bodyShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.3" />
          </filter>
        </defs>

        <g filter="url(#bodyShadow)">
          {/* Body - sitting position */}
          <ellipse 
            cx="50" cy="95" 
            rx="28" ry="20"
            fill="url(#bodyMetalGradient)"
            stroke="hsl(var(--border))"
            strokeWidth="1.5"
          />

          {/* Chest plate */}
          <rect 
            x="35" y="60" 
            width="30" height="40" 
            rx="10"
            fill="url(#bodyMetalGradient)"
            stroke="hsl(var(--border))"
            strokeWidth="1.5"
          />

          {/* Front legs */}
          <rect 
            x="30" y="90" 
            width="8" height="25" 
            rx="3"
            fill="url(#bodyMetalGradient)"
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />
          <rect 
            x="62" y="90" 
            width="8" height="25" 
            rx="3"
            fill="url(#bodyMetalGradient)"
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />

          {/* Paws */}
          <ellipse cx="34" cy="118" rx="6" ry="4" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1" />
          <ellipse cx="66" cy="118" rx="6" ry="4" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1" />

          {/* Neck */}
          <rect 
            x="40" y="45" 
            width="20" height="20" 
            rx="5"
            fill="url(#bodyMetalGradient)"
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />

          {/* Head */}
          <rect 
            x="25" y="15" 
            width="50" height="40" 
            rx="15"
            fill="url(#bodyMetalGradient)"
            stroke="hsl(var(--border))"
            strokeWidth="1.5"
          />

          {/* Snout */}
          <rect 
            x="35" y="38" 
            width="30" height="15" 
            rx="7"
            fill="hsl(var(--muted))"
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />

          {/* Nose */}
          <ellipse 
            cx="50" cy="43" 
            rx="5" ry="3"
            fill="hsl(var(--foreground) / 0.8)"
          />

          {/* Left ear */}
          <g 
            className="transition-transform duration-500"
            style={{ transform: `rotate(${earRotation.left}deg)`, transformOrigin: '32px 20px' }}
          >
            <path 
              d="M 28 18 Q 20 2 33 10 L 35 18 Z"
              fill="url(#bodyMetalGradient)"
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />
          </g>

          {/* Right ear */}
          <g 
            className="transition-transform duration-500"
            style={{ transform: `rotate(${earRotation.right}deg)`, transformOrigin: '68px 20px' }}
          >
            <path 
              d="M 72 18 Q 80 2 67 10 L 65 18 Z"
              fill="url(#bodyMetalGradient)"
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />
          </g>

          {/* Eye sockets */}
          <ellipse cx="38" cy="30" rx="7" ry="6" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1" />
          <ellipse cx="62" cy="30" rx="7" ry="6" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1" />

          {/* Eyes - glowing */}
          <ellipse 
            cx="38" cy="30" 
            rx="4" ry="3.5"
            fill={getEyeGlow()}
            filter="url(#bodyGlow)"
            className={cn(
              'transition-all duration-500',
              state === 'speaking' && 'animate-[pulse_1.5s_ease-in-out_infinite]'
            )}
          />
          <ellipse 
            cx="62" cy="30" 
            rx="4" ry="3.5"
            fill={getEyeGlow()}
            filter="url(#bodyGlow)"
            className={cn(
              'transition-all duration-500',
              state === 'speaking' && 'animate-[pulse_1.5s_ease-in-out_infinite]'
            )}
          />

          {/* Collar */}
          <rect 
            x="38" y="55" 
            width="24" height="6" 
            rx="2"
            fill="hsl(var(--primary) / 0.4)"
            stroke="hsl(var(--primary) / 0.6)"
            strokeWidth="1"
          />

          {/* Collar light */}
          <circle 
            cx="50" cy="58" 
            r="2"
            fill="hsl(142 76% 45%)"
            className="animate-pulse"
          />

          {/* Tail - wagging when speaking */}
          <path 
            d="M 75 85 Q 88 75 85 65"
            fill="none"
            stroke="url(#bodyMetalGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            className={cn(
              'transition-all duration-300',
              state === 'speaking' && 'animate-[wag_0.5s_ease-in-out_infinite]'
            )}
          />
        </g>
      </svg>

      {/* Speaking indicator */}
      {state === 'speaking' && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}
    </div>
  );
}
