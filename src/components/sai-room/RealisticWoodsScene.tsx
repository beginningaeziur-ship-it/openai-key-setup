import React from 'react';
import { cn } from '@/lib/utils';

interface RealisticWoodsSceneProps {
  className?: string;
}

/**
 * A realistic woods/camping scene with:
 * - Tent
 * - Trees and forest
 * - Lake with fishing pole
 * - Camp chair
 * - Nature sounds atmosphere
 */
export const RealisticWoodsScene: React.FC<RealisticWoodsSceneProps> = ({
  className,
}) => {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Sky gradient - dusk/twilight */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a2a3a] via-[#2a4a5a] to-[#1f3b2f]" />
      
      {/* Stars */}
      {[...Array(30)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-0.5 h-0.5 bg-white/60 rounded-full animate-twinkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 30}%`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}

      {/* Moon */}
      <div className="absolute top-[8%] right-[15%]">
        <div className="w-12 h-12 bg-amber-100/90 rounded-full shadow-lg shadow-amber-100/30" />
        <div className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-transparent via-transparent to-slate-400/30 rounded-full" />
        {/* Moon glow */}
        <div className="absolute -inset-4 bg-amber-100/10 rounded-full blur-xl" />
      </div>

      {/* Distant mountains */}
      <div className="absolute bottom-[55%] left-0 right-0 h-24">
        <svg className="w-full h-full" viewBox="0 0 1200 100" preserveAspectRatio="none">
          <path
            d="M0,100 L0,60 L200,30 L400,50 L600,20 L800,45 L1000,25 L1200,40 L1200,100 Z"
            fill="rgba(30,50,40,0.6)"
          />
          <path
            d="M0,100 L0,70 L150,45 L350,60 L550,35 L750,55 L950,40 L1200,55 L1200,100 Z"
            fill="rgba(25,45,35,0.7)"
          />
        </svg>
      </div>

      {/* Tree line - background */}
      <div className="absolute bottom-[40%] left-0 right-0 h-32">
        {[...Array(15)].map((_, i) => (
          <div
            key={`bg-tree-${i}`}
            className="absolute bottom-0"
            style={{ left: `${i * 7}%` }}
          >
            <div 
              className="bg-gradient-to-t from-emerald-950/80 to-emerald-900/60"
              style={{
                width: `${20 + Math.random() * 15}px`,
                height: `${60 + Math.random() * 40}px`,
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Lake */}
      <div className="absolute bottom-[20%] left-0 right-0 h-[22%]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a3a4a] via-[#0d2a3a] to-[#1a3a4a]">
          {/* Water reflections */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={`reflect-${i}`}
                className="absolute h-0.5 bg-amber-100/10 rounded-full animate-ripple"
                style={{
                  top: `${20 + i * 15}%`,
                  left: '10%',
                  right: '10%',
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>
          {/* Moon reflection */}
          <div className="absolute top-[20%] right-[20%] w-6 h-10 bg-gradient-to-b from-amber-100/15 to-transparent rounded-full blur-sm" />
        </div>
        
        {/* Shoreline */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#2a3a2a] to-[#1a3a4a]" />
      </div>

      {/* Forest floor/clearing */}
      <div className="absolute bottom-0 left-0 right-0 h-[22%] bg-gradient-to-b from-[#1f2f1f] via-[#2a3a2a] to-[#1a2a1a]">
        {/* Grass texture */}
        <div className="absolute inset-0 opacity-40">
          {[...Array(40)].map((_, i) => (
            <div
              key={`grass-${i}`}
              className="absolute w-0.5 bg-emerald-600/40 rounded-t-full"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: 0,
                height: `${4 + Math.random() * 8}px`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Tent - left side */}
      <div className="absolute bottom-[18%] left-[8%] w-36 h-28">
        {/* Main tent body */}
        <div className="absolute bottom-0 w-full h-20">
          <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
            <polygon
              points="50,5 0,60 100,60"
              fill="rgba(80,120,60,0.8)"
              stroke="rgba(60,90,45,0.9)"
              strokeWidth="1"
            />
            {/* Tent flap/entrance */}
            <polygon
              points="50,15 35,60 65,60"
              fill="rgba(30,50,30,0.8)"
            />
          </svg>
        </div>
        {/* Tent poles visible */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-1 h-16 bg-amber-700/50 rounded" />
        {/* Guy ropes */}
        <div className="absolute bottom-0 left-0 w-6 h-px bg-slate-400/30 transform -rotate-45" />
        <div className="absolute bottom-0 right-0 w-6 h-px bg-slate-400/30 transform rotate-45" />
      </div>

      {/* Camp chair */}
      <div className="absolute bottom-[16%] left-[35%] w-16 h-18">
        {/* Chair frame */}
        <div className="absolute bottom-0 w-12">
          {/* Legs */}
          <div className="absolute bottom-0 left-0 w-1 h-8 bg-slate-600/60 rounded transform -rotate-6" />
          <div className="absolute bottom-0 right-0 w-1 h-8 bg-slate-600/60 rounded transform rotate-6" />
          <div className="absolute bottom-0 left-2 w-1 h-6 bg-slate-600/50 rounded" />
          <div className="absolute bottom-0 right-2 w-1 h-6 bg-slate-600/50 rounded" />
          {/* Seat */}
          <div className="absolute bottom-4 left-1 right-1 h-6 bg-gradient-to-b from-orange-800/60 to-orange-900/50 rounded-t" />
          {/* Back */}
          <div className="absolute bottom-8 left-0 right-0 h-8 bg-gradient-to-t from-orange-900/50 to-orange-800/40 rounded-t-lg" />
        </div>
        {/* Cup holder with drink */}
        <div className="absolute bottom-6 -right-1 w-3 h-4 bg-slate-500/40 rounded" />
      </div>

      {/* Fishing pole in water */}
      <div className="absolute bottom-[22%] right-[25%]">
        {/* Pole holder/stand on shore */}
        <div className="absolute bottom-0 w-3 h-6 bg-amber-800/50 rounded transform -rotate-12" />
        {/* Fishing rod */}
        <div 
          className="absolute bottom-4 w-1 h-32 bg-gradient-to-t from-amber-700/60 to-amber-600/40 rounded origin-bottom"
          style={{ transform: 'rotate(-30deg)' }}
        />
        {/* Fishing line */}
        <div 
          className="absolute bottom-[70px] left-[60px] w-px h-16 bg-slate-300/20"
          style={{ transform: 'rotate(15deg)' }}
        />
        {/* Bobber */}
        <div className="absolute bottom-[42%] right-[-20px] w-2 h-3">
          <div className="w-full h-1/2 bg-red-500/60 rounded-t-full" />
          <div className="w-full h-1/2 bg-white/50 rounded-b-full" />
        </div>
        {/* Ripples from bobber */}
        <div className="absolute bottom-[40%] right-[-24px] w-6 h-2 border border-slate-400/20 rounded-full animate-ripple" />
      </div>

      {/* Foreground trees */}
      <div className="absolute bottom-[15%] left-[60%] w-16">
        {/* Tree trunk */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-24 bg-gradient-to-t from-amber-950/70 to-amber-900/50 rounded" />
        {/* Branches/foliage */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-24 h-20 bg-gradient-to-t from-emerald-900/70 to-emerald-800/50" 
          style={{ clipPath: 'polygon(50% 0%, 10% 100%, 90% 100%)' }} 
        />
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-20 h-16 bg-gradient-to-t from-emerald-900/60 to-emerald-800/40" 
          style={{ clipPath: 'polygon(50% 0%, 15% 100%, 85% 100%)' }} 
        />
      </div>

      <div className="absolute bottom-[12%] right-[8%] w-12">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-20 bg-gradient-to-t from-amber-950/60 to-amber-900/40 rounded" />
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-18 h-16 bg-gradient-to-t from-emerald-950/70 to-emerald-900/50" 
          style={{ clipPath: 'polygon(50% 0%, 5% 100%, 95% 100%)' }} 
        />
      </div>

      {/* Campfire glow (subtle, fire burned down) */}
      <div className="absolute bottom-[14%] left-[48%]">
        <div className="w-8 h-3 bg-gradient-to-t from-orange-600/20 to-transparent rounded-full blur-sm" />
        <div className="w-6 h-2 bg-orange-900/30 rounded-full mx-auto" />
        {/* Embers */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`ember-${i}`}
            className="absolute w-1 h-1 bg-orange-500/40 rounded-full animate-ember"
            style={{
              left: `${30 + i * 20}%`,
              bottom: '4px',
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Fireflies */}
      {[...Array(12)].map((_, i) => (
        <div
          key={`firefly-${i}`}
          className="absolute w-1 h-1 bg-yellow-300/60 rounded-full animate-firefly"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${40 + Math.random() * 40}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Mist over lake */}
      <div className="absolute bottom-[20%] left-0 right-0 h-12 bg-gradient-to-t from-slate-400/5 via-slate-300/8 to-transparent" />

      {/* Ambient lighting */}
      <div className="absolute top-0 right-[10%] w-64 h-64 bg-amber-100/5 rounded-full blur-3xl" />

      {/* Animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        @keyframes ripple {
          0% { transform: scaleX(1); opacity: 0.3; }
          100% { transform: scaleX(1.5); opacity: 0; }
        }
        .animate-ripple {
          animation: ripple 3s ease-out infinite;
        }
        @keyframes firefly {
          0%, 100% { opacity: 0; transform: translateY(0); }
          50% { opacity: 0.8; transform: translateY(-10px); }
        }
        .animate-firefly {
          animation: firefly ease-in-out infinite;
        }
        @keyframes ember {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.6; }
        }
        .animate-ember {
          animation: ember 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
