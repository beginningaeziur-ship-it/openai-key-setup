import { cn } from '@/lib/utils';

type SAIState = 'resting' | 'alert' | 'attentive' | 'listening' | 'speaking' | 'happy';

interface SAICharacterProps {
  state?: SAIState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBreathing?: boolean;
  'aria-label'?: string;
}

/**
 * SAICharacter — SAI the Dalmatian robot service dog
 *
 * Accessible SVG character used on the Aezuir home screen and room pages.
 * Animations adapt to the current SAI state (speaking, listening, happy, etc.).
 * Dalmatian markings (black spots on cream/white) distinguish SAI visually.
 */
export function SAICharacter({
  state = 'attentive',
  size = 'lg',
  className,
  showBreathing = true,
  'aria-label': ariaLabel,
}: SAICharacterProps) {
  const sizeMap = {
    sm: 'w-24 h-28',
    md: 'w-40 h-48',
    lg: 'w-56 h-64',
    xl: 'w-72 h-80',
  };

  const eyeColor: Record<SAIState, string> = {
    resting: '#8b6d45',
    attentive: '#a07850',
    listening: '#b08860',
    speaking: '#c09870',
    alert: '#6b52a0',
    happy: '#d0a86a',
  };

  const earLeft: Record<SAIState, number> = {
    resting: 0,
    attentive: -5,
    listening: -15,
    speaking: -3,
    alert: -10,
    happy: -8,
  };

  const tailWag = state === 'speaking' || state === 'happy';
  const earWiggle = state === 'listening';
  const mouthOpen = state === 'speaking';
  const eyePulse = state === 'speaking';

  const label = ariaLabel ?? `SAI the Dalmatian robot service dog, ${state}`;

  return (
    <div
      className={cn('relative flex items-end justify-center', sizeMap[size], className)}
      role="img"
      aria-label={label}
    >
      {/* Ground shadow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/20 rounded-full blur-md" />

      <svg
        viewBox="0 0 120 140"
        className={cn(
          'w-full h-full transition-all duration-700',
          showBreathing && state === 'resting' && 'animate-pulse',
        )}
        style={{ marginBottom: '4px' }}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="saiBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5f0e8" />
            <stop offset="50%" stopColor="#ebe6de" />
            <stop offset="100%" stopColor="#f5f0e8" />
          </linearGradient>
          <linearGradient id="saiCollar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7b3fc4" />
            <stop offset="50%" stopColor="#9d57e0" />
            <stop offset="100%" stopColor="#7b3fc4" />
          </linearGradient>
          <radialGradient id="saiEyeShine" cx="30%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id="saiShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
          </filter>
        </defs>

        <g filter="url(#saiShadow)">
          {/* Tail */}
          <g
            className={tailWag ? 'animate-[tailWag_0.35s_ease-in-out_infinite]' : ''}
            style={{ transformOrigin: '93px 83px' }}
          >
            <path
              d="M 88 83 Q 103 68 108 53 Q 113 43 106 38"
              fill="none"
              stroke="url(#saiBody)"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M 88 83 Q 103 68 108 53 Q 113 43 106 38"
              fill="none"
              stroke="#d4cfc5"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <circle cx="98" cy="63" r="3" fill="#3d3d3d" />
            <circle cx="104" cy="50" r="2" fill="#3d3d3d" />
          </g>

          {/* Back body */}
          <ellipse cx="60" cy="100" rx="32" ry="22" fill="url(#saiBody)" stroke="#d4cfc5" strokeWidth="2" />
          <ellipse cx="44" cy="95" rx="5" ry="4" fill="#3d3d3d" />
          <ellipse cx="71" cy="98" rx="6" ry="5" fill="#3d3d3d" />
          <ellipse cx="55" cy="107" rx="4" ry="3" fill="#3d3d3d" />

          {/* Chest */}
          <ellipse cx="60" cy="75" rx="25" ry="30" fill="url(#saiBody)" stroke="#d4cfc5" strokeWidth="2" />
          <ellipse cx="48" cy="68" rx="4" ry="3" fill="#3d3d3d" />
          <ellipse cx="70" cy="72" rx="3" ry="4" fill="#3d3d3d" />

          {/* SAI chest sensor (purple Aezuir accent) */}
          <circle cx="60" cy="78" r="8" fill="#2d1f3f" stroke="#4a3070" strokeWidth="1.5" />
          <circle cx="60" cy="78" r="5" fill="#7b3fc4" opacity="0.7" />
          <circle cx="58" cy="76" r="2" fill="#c084fc" opacity="0.9" />

          {/* Left front leg */}
          <rect x="38" y="95" width="12" height="28" rx="5" fill="url(#saiBody)" stroke="#d4cfc5" strokeWidth="1.5" />
          <ellipse cx="44" cy="126" rx="8" ry="5" fill="url(#saiBody)" stroke="#d4cfc5" strokeWidth="1.5" />
          <circle cx="40" cy="127" r="2" fill="#d4cfc5" />
          <circle cx="44" cy="128" r="2" fill="#d4cfc5" />
          <circle cx="48" cy="127" r="2" fill="#d4cfc5" />

          {/* Right front leg */}
          <rect x="68" y="95" width="12" height="28" rx="5" fill="url(#saiBody)" stroke="#d4cfc5" strokeWidth="1.5" />
          <ellipse cx="74" cy="126" rx="8" ry="5" fill="url(#saiBody)" stroke="#d4cfc5" strokeWidth="1.5" />
          <circle cx="70" cy="127" r="2" fill="#d4cfc5" />
          <circle cx="74" cy="128" r="2" fill="#d4cfc5" />
          <circle cx="78" cy="127" r="2" fill="#d4cfc5" />

          <circle cx="44" cy="105" r="3" fill="#3d3d3d" />
          <circle cx="74" cy="108" r="2.5" fill="#3d3d3d" />

          {/* Collar — Aezuir purple */}
          <ellipse cx="60" cy="55" rx="20" ry="6" fill="url(#saiCollar)" stroke="#5a2f96" strokeWidth="1.5" />
          <circle cx="60" cy="60" r="4" fill="#c084fc" stroke="#9d57e0" strokeWidth="1" />

          {/* Neck */}
          <ellipse cx="60" cy="50" rx="18" ry="12" fill="url(#saiBody)" stroke="#d4cfc5" strokeWidth="2" />

          {/* Head */}
          <ellipse cx="60" cy="28" rx="28" ry="24" fill="url(#saiBody)" stroke="#d4cfc5" strokeWidth="2" />

          {/* Head spots */}
          <ellipse cx="38" cy="20" rx="5" ry="4" fill="#3d3d3d" />
          <ellipse cx="78" cy="18" rx="4" ry="5" fill="#3d3d3d" />
          <ellipse cx="70" cy="35" rx="3" ry="2" fill="#3d3d3d" />
          <circle cx="48" cy="12" r="3" fill="#3d3d3d" />

          {/* Left ear */}
          <g
            className={earWiggle ? 'animate-[earWiggle_0.4s_ease-in-out_infinite]' : 'transition-transform duration-500'}
            style={{ transform: `rotate(${earLeft[state]}deg)`, transformOrigin: '38px 18px' }}
          >
            <ellipse cx="30" cy="28" rx="12" ry="18" fill="url(#saiBody)" stroke="#d4cfc5" strokeWidth="1.5" />
            <ellipse cx="28" cy="25" rx="4" ry="5" fill="#3d3d3d" />
            <circle cx="32" cy="35" r="3" fill="#3d3d3d" />
          </g>

          {/* Right ear */}
          <g
            className={earWiggle ? 'animate-[earWiggle_0.4s_ease-in-out_infinite]' : 'transition-transform duration-500'}
            style={{ transform: `rotate(${-earLeft[state]}deg)`, transformOrigin: '82px 18px', animationDelay: '0.1s' }}
          >
            <ellipse cx="90" cy="28" rx="12" ry="18" fill="url(#saiBody)" stroke="#d4cfc5" strokeWidth="1.5" />
            <ellipse cx="92" cy="24" rx="5" ry="4" fill="#3d3d3d" />
            <circle cx="88" cy="33" r="2.5" fill="#3d3d3d" />
          </g>

          {/* Snout */}
          <ellipse cx="60" cy="38" rx="14" ry="10" fill="url(#saiBody)" stroke="#d4cfc5" strokeWidth="1.5" />

          {/* Nose */}
          <ellipse cx="60" cy="34" rx="6" ry="4" fill="#2d2d2d" />
          <ellipse cx="58" cy="33" rx="2" ry="1" fill="#4d4d4d" />

          {/* Mouth — open when speaking, smile otherwise */}
          {mouthOpen ? (
            <path
              d="M 52 42 Q 56 48 60 49 Q 64 48 68 42"
              fill="#f9c8c8"
              stroke="#2d2d2d"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="animate-[mouthMove_0.8s_ease-in-out_infinite]"
            />
          ) : (
            <path
              d="M 52 42 Q 60 47 68 42"
              fill="none"
              stroke="#2d2d2d"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          )}

          {/* Left eye */}
          <ellipse cx="48" cy="26" rx="8" ry="9" fill="#ffffff" stroke="#d4cfc5" strokeWidth="1" />
          <ellipse
            cx="48"
            cy="27"
            rx="5"
            ry="6"
            fill={eyeColor[state]}
            className={eyePulse ? 'animate-pulse' : 'transition-all duration-500'}
          />
          <circle cx="46" cy="24" r="2.5" fill="#ffffff" />
          <circle cx="50" cy="28" r="1" fill="#ffffff" opacity="0.6" />

          {/* Right eye */}
          <ellipse cx="72" cy="26" rx="8" ry="9" fill="#ffffff" stroke="#d4cfc5" strokeWidth="1" />
          <ellipse
            cx="72"
            cy="27"
            rx="5"
            ry="6"
            fill={eyeColor[state]}
            className={eyePulse ? 'animate-pulse' : 'transition-all duration-500'}
          />
          <circle cx="70" cy="24" r="2.5" fill="#ffffff" />
          <circle cx="74" cy="28" r="1" fill="#ffffff" opacity="0.6" />

          {/* Eyebrows */}
          <path d="M 40 18 Q 48 16 54 19" fill="none" stroke="#3d3d3d" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
          <path d="M 80 18 Q 72 16 66 19" fill="none" stroke="#3d3d3d" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />

          {/* Happy blush marks */}
          {(state === 'happy' || state === 'speaking') && (
            <>
              <ellipse cx="38" cy="32" rx="5" ry="3" fill="#ffb0b0" opacity="0.45" />
              <ellipse cx="82" cy="32" rx="5" ry="3" fill="#ffb0b0" opacity="0.45" />
            </>
          )}
        </g>

        {/* Listening status dot */}
        {state === 'listening' && (
          <circle cx="95" cy="10" r="5" fill="#22c55e" className="animate-pulse" />
        )}

        <style>{`
          @keyframes tailWag {
            0%, 100% { transform: rotate(-10deg); }
            50% { transform: rotate(10deg); }
          }
          @keyframes earWiggle {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-8deg); }
          }
          @keyframes mouthMove {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(1.2); }
          }
        `}</style>
      </svg>
    </div>
  );
}
