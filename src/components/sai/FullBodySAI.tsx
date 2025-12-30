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
 * FullBodySAI - Cute dalmatian-style robot service dog
 * 
 * Full-bodied view showing sitting robot dog on the ground
 * Features: animated mouth when speaking, wagging tail, dalmatian spots
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
    md: 'w-40 h-48',
    lg: 'w-56 h-64',
    xl: 'w-72 h-80',
  };

  const getEyeGlow = () => {
    const colors = {
      alert: 'hsl(var(--primary))',
      attentive: 'hsl(25 60% 35%)',
      listening: 'hsl(25 70% 40%)',
      speaking: 'hsl(25 80% 45%)',
      resting: 'hsl(25 50% 30%)',
    };
    return colors[state];
  };

  const getEarRotation = () => {
    switch (state) {
      case 'alert': return { left: -10, right: 10 };
      case 'attentive': return { left: -5, right: 5 };
      case 'listening': return { left: -15, right: 15 };
      case 'speaking': return { left: -3, right: 3 };
      default: return { left: 0, right: 0 };
    }
  };

  const earRotation = getEarRotation();

  return (
    <div className={cn(
      'relative flex items-end justify-center',
      sizeConfig[size],
      className
    )}>
      {/* Ground shadow */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/20 rounded-full blur-md"
      />

      <svg 
        viewBox="0 0 120 140" 
        className={cn(
          'w-full h-full transition-all duration-700',
          showBreathing && state === 'resting' && 'animate-[breathe_4s_ease-in-out_infinite]'
        )}
        style={{ marginBottom: '4px' }}
      >
        <defs>
          {/* Cream/white base color for dalmatian */}
          <linearGradient id="dalmatianBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5f0e8" />
            <stop offset="50%" stopColor="#ebe6de" />
            <stop offset="100%" stopColor="#f5f0e8" />
          </linearGradient>

          {/* Metallic collar gradient */}
          <linearGradient id="collarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b7355" />
            <stop offset="50%" stopColor="#c4a77d" />
            <stop offset="100%" stopColor="#8b7355" />
          </linearGradient>

          {/* Eye shine */}
          <radialGradient id="eyeShine" cx="30%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
          </filter>
        </defs>

        <g filter="url(#softShadow)">
          {/* Tail - wagging animation when speaking */}
          <g 
            className={cn(
              'origin-center',
              state === 'speaking' && 'animate-[tailWag_0.3s_ease-in-out_infinite]'
            )}
            style={{ transformOrigin: '95px 85px' }}
          >
            <path 
              d="M 90 85 Q 105 70 110 55 Q 115 45 108 40"
              fill="none"
              stroke="url(#dalmatianBody)"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path 
              d="M 90 85 Q 105 70 110 55 Q 115 45 108 40"
              fill="none"
              stroke="#d4cfc5"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Tail spots */}
            <circle cx="100" cy="65" r="3" fill="#3d3d3d" />
            <circle cx="106" cy="52" r="2" fill="#3d3d3d" />
          </g>

          {/* Back body - sitting position */}
          <ellipse 
            cx="60" cy="100" 
            rx="32" ry="22"
            fill="url(#dalmatianBody)"
            stroke="#d4cfc5"
            strokeWidth="2"
          />

          {/* Body spots */}
          <ellipse cx="45" cy="95" rx="5" ry="4" fill="#3d3d3d" />
          <ellipse cx="72" cy="98" rx="6" ry="5" fill="#3d3d3d" />
          <ellipse cx="55" cy="105" rx="4" ry="3" fill="#3d3d3d" />

          {/* Front chest/body */}
          <ellipse 
            cx="60" cy="75" 
            rx="25" ry="30"
            fill="url(#dalmatianBody)"
            stroke="#d4cfc5"
            strokeWidth="2"
          />

          {/* Chest spots */}
          <ellipse cx="48" cy="68" rx="4" ry="3" fill="#3d3d3d" />
          <ellipse cx="70" cy="72" rx="3" ry="4" fill="#3d3d3d" />

          {/* Camera/sensor on chest */}
          <circle cx="60" cy="78" r="8" fill="#2d2d2d" stroke="#1a1a1a" strokeWidth="1.5" />
          <circle cx="60" cy="78" r="5" fill="#1a1a1a" />
          <circle cx="58" cy="76" r="2" fill="#4a4a4a" />

          {/* Left front leg */}
          <rect 
            x="38" y="95" 
            width="12" height="28" 
            rx="5"
            fill="url(#dalmatianBody)"
            stroke="#d4cfc5"
            strokeWidth="1.5"
          />
          {/* Left paw */}
          <ellipse cx="44" cy="126" rx="8" ry="5" fill="url(#dalmatianBody)" stroke="#d4cfc5" strokeWidth="1.5" />
          {/* Paw details */}
          <circle cx="40" cy="127" r="2" fill="#d4cfc5" />
          <circle cx="44" cy="128" r="2" fill="#d4cfc5" />
          <circle cx="48" cy="127" r="2" fill="#d4cfc5" />

          {/* Right front leg */}
          <rect 
            x="68" y="95" 
            width="12" height="28" 
            rx="5"
            fill="url(#dalmatianBody)"
            stroke="#d4cfc5"
            strokeWidth="1.5"
          />
          {/* Right paw */}
          <ellipse cx="74" cy="126" rx="8" ry="5" fill="url(#dalmatianBody)" stroke="#d4cfc5" strokeWidth="1.5" />
          {/* Paw details */}
          <circle cx="70" cy="127" r="2" fill="#d4cfc5" />
          <circle cx="74" cy="128" r="2" fill="#d4cfc5" />
          <circle cx="78" cy="127" r="2" fill="#d4cfc5" />

          {/* Leg spots */}
          <circle cx="44" cy="105" r="3" fill="#3d3d3d" />
          <circle cx="74" cy="108" r="2.5" fill="#3d3d3d" />

          {/* Collar */}
          <ellipse 
            cx="60" cy="55" 
            rx="20" ry="6"
            fill="url(#collarGradient)"
            stroke="#5c4a35"
            strokeWidth="1.5"
          />
          {/* Collar tag */}
          <circle cx="60" cy="60" r="4" fill="#c4a77d" stroke="#8b7355" strokeWidth="1" />

          {/* Neck */}
          <ellipse 
            cx="60" cy="50" 
            rx="18" ry="12"
            fill="url(#dalmatianBody)"
            stroke="#d4cfc5"
            strokeWidth="2"
          />

          {/* Head - round puppy style */}
          <ellipse 
            cx="60" cy="28" 
            rx="28" ry="24"
            fill="url(#dalmatianBody)"
            stroke="#d4cfc5"
            strokeWidth="2"
          />

          {/* Head spots */}
          <ellipse cx="38" cy="20" rx="5" ry="4" fill="#3d3d3d" />
          <ellipse cx="78" cy="18" rx="4" ry="5" fill="#3d3d3d" />
          <ellipse cx="70" cy="35" rx="3" ry="2" fill="#3d3d3d" />
          <circle cx="48" cy="12" r="3" fill="#3d3d3d" />

          {/* Left ear - floppy dalmatian style */}
          <g 
            className="transition-transform duration-500"
            style={{ transform: `rotate(${earRotation.left}deg)`, transformOrigin: '38px 18px' }}
          >
            <ellipse 
              cx="30" cy="28" 
              rx="12" ry="18"
              fill="url(#dalmatianBody)"
              stroke="#d4cfc5"
              strokeWidth="1.5"
            />
            {/* Ear spots */}
            <ellipse cx="28" cy="25" rx="4" ry="5" fill="#3d3d3d" />
            <circle cx="32" cy="35" r="3" fill="#3d3d3d" />
          </g>

          {/* Right ear - floppy dalmatian style */}
          <g 
            className="transition-transform duration-500"
            style={{ transform: `rotate(${earRotation.right}deg)`, transformOrigin: '82px 18px' }}
          >
            <ellipse 
              cx="90" cy="28" 
              rx="12" ry="18"
              fill="url(#dalmatianBody)"
              stroke="#d4cfc5"
              strokeWidth="1.5"
            />
            {/* Ear spots */}
            <ellipse cx="92" cy="24" rx="5" ry="4" fill="#3d3d3d" />
            <circle cx="88" cy="33" r="2.5" fill="#3d3d3d" />
          </g>

          {/* Snout */}
          <ellipse 
            cx="60" cy="38" 
            rx="14" ry="10"
            fill="url(#dalmatianBody)"
            stroke="#d4cfc5"
            strokeWidth="1.5"
          />

          {/* Nose */}
          <ellipse 
            cx="60" cy="34" 
            rx="6" ry="4"
            fill="#2d2d2d"
          />
          {/* Nose shine */}
          <ellipse cx="58" cy="33" rx="2" ry="1" fill="#4d4d4d" />

          {/* Mouth - static smile */}
          <path 
            d="M 52 42 Q 60 46 68 42"
            fill="none"
            stroke="#2d2d2d"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Left eye - large puppy eyes */}
          <ellipse 
            cx="48" cy="26" 
            rx="8" ry="9"
            fill="#ffffff"
            stroke="#d4cfc5"
            strokeWidth="1"
          />
          {/* Pupil */}
          <ellipse 
            cx="48" cy="27" 
            rx="5" ry="6"
            fill={getEyeGlow()}
            className={cn(
              'transition-all duration-500',
              state === 'speaking' && 'animate-[pulse_1.5s_ease-in-out_infinite]'
            )}
          />
          {/* Eye shine */}
          <circle cx="46" cy="24" r="2.5" fill="#ffffff" />
          <circle cx="50" cy="28" r="1" fill="#ffffff" opacity="0.6" />

          {/* Right eye - large puppy eyes */}
          <ellipse 
            cx="72" cy="26" 
            rx="8" ry="9"
            fill="#ffffff"
            stroke="#d4cfc5"
            strokeWidth="1"
          />
          {/* Pupil */}
          <ellipse 
            cx="72" cy="27" 
            rx="5" ry="6"
            fill={getEyeGlow()}
            className={cn(
              'transition-all duration-500',
              state === 'speaking' && 'animate-[pulse_1.5s_ease-in-out_infinite]'
            )}
          />
          {/* Eye shine */}
          <circle cx="70" cy="24" r="2.5" fill="#ffffff" />
          <circle cx="74" cy="28" r="1" fill="#ffffff" opacity="0.6" />

          {/* Eyebrows - subtle */}
          <path d="M 40 18 Q 48 16 54 19" fill="none" stroke="#3d3d3d" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
          <path d="M 80 18 Q 72 16 66 19" fill="none" stroke="#3d3d3d" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        </g>

        {/* Add custom styles for animations */}
        <style>
          {`
            @keyframes tailWag {
              0%, 100% { transform: rotate(-8deg); }
              50% { transform: rotate(8deg); }
            }
            @keyframes mouthMove {
              0%, 100% { transform: scaleY(1); }
              50% { transform: scaleY(1.3); }
            }
          `}
        </style>
      </svg>

      {/* Listening indicator */}
      {state === 'listening' && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
      )}
    </div>
  );
}
