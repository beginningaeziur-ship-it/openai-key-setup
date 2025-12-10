import React from 'react';
import { cn } from '@/lib/utils';

interface RealisticCabinSceneProps {
  className?: string;
  showSnow?: boolean;
}

/**
 * A realistic remote log cabin scene with:
 * - Big window with snow outside
 * - Fireplace with crackling fire
 * - Comfortable chair with ottoman
 * - Bear skin rug
 * - Warm lighting from fire
 */
export const RealisticCabinScene: React.FC<RealisticCabinSceneProps> = ({
  className,
  showSnow = true,
}) => {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Base gradient - warm cabin atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a120a] via-[#2d1b0e] to-[#1a120a]" />

      {/* Log cabin walls texture */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(12)].map((_, i) => (
          <div
            key={`log-${i}`}
            className="absolute left-0 right-0 h-8 bg-gradient-to-r from-amber-900/30 via-amber-800/20 to-amber-900/30"
            style={{ top: `${i * 8}%` }}
          >
            {/* Log grain */}
            <div className="absolute inset-y-2 left-[10%] w-[20%] border-t border-amber-700/10 rounded-full" />
            <div className="absolute inset-y-3 right-[15%] w-[15%] border-b border-amber-700/10 rounded-full" />
          </div>
        ))}
      </div>

      {/* Big window with snow */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-64 h-52">
        {/* Window frame - thick wooden */}
        <div className="absolute inset-0 rounded-t-lg border-[12px] border-amber-900/80 bg-gradient-to-b from-slate-600/30 via-slate-500/20 to-slate-600/40 shadow-inner overflow-hidden">
          {/* Window panes */}
          <div className="absolute top-0 bottom-0 left-1/3 w-3 bg-amber-900/70" />
          <div className="absolute top-0 bottom-0 right-1/3 w-3 bg-amber-900/70" />
          <div className="absolute left-0 right-0 top-1/2 h-3 -translate-y-1/2 bg-amber-900/70" />
          
          {/* Snow outside - distant mountains/trees */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-300/20 to-transparent" />
          <div className="absolute bottom-4 left-[10%] w-[20%] h-12 bg-slate-400/15 rounded-t-full" /> {/* Tree */}
          <div className="absolute bottom-4 right-[15%] w-[15%] h-16 bg-slate-400/12 rounded-t-full" /> {/* Tree */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[30%] h-20 bg-slate-500/10 rounded-t-3xl" /> {/* Mountain */}
          
          {/* Falling snow */}
          {showSnow && [...Array(40)].map((_, i) => (
            <div
              key={`snow-${i}`}
              className="absolute w-1.5 h-1.5 bg-white/60 rounded-full animate-snow"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 3}s`,
              }}
            />
          ))}
          
          {/* Frost on edges */}
          <div className="absolute inset-0 border-[6px] border-white/10 rounded pointer-events-none" />
        </div>
        
        {/* Window sill */}
        <div className="absolute -bottom-2 left-0 right-0 h-4 bg-amber-900/60 rounded-b shadow-lg" />
        
        {/* Curtains */}
        <div className="absolute -top-2 -left-6 w-10 h-60 bg-gradient-to-b from-red-950/60 via-red-900/50 to-red-950/40 rounded-b shadow" />
        <div className="absolute -top-2 -right-6 w-10 h-60 bg-gradient-to-b from-red-950/60 via-red-900/50 to-red-950/40 rounded-b shadow" />
      </div>

      {/* Fireplace - center bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-44">
        {/* Stone fireplace structure */}
        <div className="absolute bottom-0 w-full h-full">
          {/* Main fireplace body */}
          <div className="absolute bottom-0 w-full h-36 bg-gradient-to-t from-stone-800/80 via-stone-700/60 to-stone-600/50 rounded-t-lg">
            {/* Stone texture */}
            <div className="absolute inset-2 overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-stone-600/30 rounded"
                  style={{
                    left: `${(i % 4) * 25}%`,
                    top: `${Math.floor(i / 4) * 50}%`,
                    width: `${20 + Math.random() * 8}%`,
                    height: `${40 + Math.random() * 10}%`,
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Fire opening */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-24 bg-gradient-to-t from-[#1a0a00] via-[#2a1000] to-stone-900/80 rounded-t-2xl overflow-hidden">
            {/* Fire glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-orange-600/40 via-orange-500/20 to-transparent animate-flicker" />
            
            {/* Flames */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-16">
              <div className="absolute bottom-0 left-1/4 w-4 h-12 bg-gradient-to-t from-orange-600/80 via-yellow-500/60 to-transparent rounded-t-full animate-flame" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-14 bg-gradient-to-t from-orange-500/90 via-yellow-400/70 to-transparent rounded-t-full animate-flame" style={{ animationDelay: '0.2s' }} />
              <div className="absolute bottom-0 right-1/4 w-4 h-11 bg-gradient-to-t from-red-600/80 via-orange-500/60 to-transparent rounded-t-full animate-flame" style={{ animationDelay: '0.4s' }} />
              {/* Blue base of fire */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-3 bg-blue-500/30 rounded-full blur-sm" />
            </div>
            
            {/* Logs */}
            <div className="absolute bottom-1 left-3 w-10 h-2.5 bg-amber-950/80 rounded-full rotate-12" />
            <div className="absolute bottom-0 right-4 w-9 h-2 bg-amber-950/70 rounded-full -rotate-6" />
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-2.5 bg-stone-950/60 rounded-full" />
          </div>
          
          {/* Mantle */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-amber-900/70 rounded-t shadow-lg" />
          
          {/* Items on mantle */}
          <div className="absolute -top-6 left-4 w-8 h-10 bg-amber-100/15 rounded" /> {/* Candle/vase */}
          <div className="absolute -top-4 right-6 w-12 h-8 bg-amber-800/30 rounded" /> {/* Photo frame */}
        </div>
        
        {/* Fire glow on room */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-orange-500/10 rounded-full blur-3xl animate-flicker" />
      </div>

      {/* Comfortable chair with ottoman - right side */}
      <div className="absolute bottom-14 right-[12%] w-28 h-32">
        {/* Chair */}
        <div className="absolute bottom-0 w-24">
          {/* Legs */}
          <div className="absolute bottom-0 left-2 w-2 h-4 bg-amber-950/70 rounded" />
          <div className="absolute bottom-0 right-2 w-2 h-4 bg-amber-950/70 rounded" />
          {/* Seat */}
          <div className="absolute bottom-3 w-full h-8 bg-gradient-to-t from-red-950/60 to-red-900/40 rounded-t shadow" />
          {/* Backrest */}
          <div className="absolute bottom-10 left-[10%] w-[80%] h-16 bg-gradient-to-t from-red-900/50 to-red-800/40 rounded-t-2xl shadow" />
          {/* Tufting */}
          <div className="absolute bottom-14 left-[20%] w-2 h-2 rounded-full bg-red-700/30" />
          <div className="absolute bottom-14 right-[20%] w-2 h-2 rounded-full bg-red-700/30" />
          {/* Armrests */}
          <div className="absolute bottom-6 -left-1 w-5 h-10 bg-red-900/45 rounded-t-lg rounded-b" />
          <div className="absolute bottom-6 -right-1 w-5 h-10 bg-red-900/45 rounded-t-lg rounded-b" />
        </div>
        
        {/* Throw blanket */}
        <div className="absolute bottom-8 -left-2 w-10 h-16 bg-gradient-to-b from-amber-800/40 to-amber-900/30 rounded-lg transform -rotate-12" />
        
        {/* Ottoman */}
        <div className="absolute bottom-0 -left-8 w-14 h-8 bg-gradient-to-t from-red-950/50 to-red-900/35 rounded-t shadow">
          {/* Ottoman legs */}
          <div className="absolute bottom-0 left-1 w-1.5 h-2 bg-amber-950/60" />
          <div className="absolute bottom-0 right-1 w-1.5 h-2 bg-amber-950/60" />
        </div>
      </div>

      {/* Bear skin rug */}
      <div className="absolute bottom-4 left-[25%] w-[40%] h-20">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-950/50 via-amber-900/60 to-amber-950/50 rounded-[40%] shadow-inner">
          {/* Fur texture */}
          <div className="absolute inset-2 opacity-30">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute h-px bg-amber-700/40 rounded"
                style={{
                  left: `${5 + Math.random() * 90}%`,
                  top: `${10 + Math.random() * 80}%`,
                  width: `${8 + Math.random() * 12}%`,
                  transform: `rotate(${-10 + Math.random() * 20}deg)`,
                }}
              />
            ))}
          </div>
          {/* Head shape at top */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-8 bg-amber-900/50 rounded-t-full" />
          {/* Ears */}
          <div className="absolute -top-6 left-[35%] w-4 h-4 bg-amber-900/45 rounded-full" />
          <div className="absolute -top-6 right-[35%] w-4 h-4 bg-amber-900/45 rounded-full" />
        </div>
      </div>

      {/* Side table with drink */}
      <div className="absolute bottom-12 right-[38%] w-10 h-14">
        <div className="absolute bottom-0 w-full h-10 bg-amber-950/50 rounded-t shadow">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-8 bg-amber-950/70" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-2 bg-amber-950/60 rounded-full" />
        </div>
        {/* Hot drink */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-4 bg-slate-600/40 rounded">
          {/* Steam */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-4 opacity-40">
            <div className="absolute left-0 w-0.5 h-2 bg-white/30 rounded animate-steam" />
            <div className="absolute left-1 w-0.5 h-3 bg-white/25 rounded animate-steam" style={{ animationDelay: '0.5s' }} />
            <div className="absolute left-2 w-0.5 h-2 bg-white/20 rounded animate-steam" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>

      {/* Wooden floor */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-amber-950/70 to-amber-900/40">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0 h-full border-r border-amber-800/20"
            style={{ left: `${i * 6.25}%`, width: '6.25%' }}
          />
        ))}
      </div>

      {/* Ambient fire lighting */}
      <div className="absolute bottom-0 left-1/4 right-1/4 h-48 bg-gradient-to-t from-orange-600/8 via-orange-500/4 to-transparent pointer-events-none animate-flicker" />

      {/* Animations */}
      <style>{`
        @keyframes snow {
          0% { transform: translateY(-10px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(300px); opacity: 0; }
        }
        .animate-snow {
          animation: snow ease-in-out infinite;
        }
        @keyframes flame {
          0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.9; }
          50% { transform: scaleY(1.15) scaleX(0.9); opacity: 1; }
        }
        .animate-flame {
          animation: flame 0.5s ease-in-out infinite;
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .animate-flicker {
          animation: flicker 2s ease-in-out infinite;
        }
        @keyframes steam {
          0% { transform: translateY(0) scaleX(1); opacity: 0.4; }
          100% { transform: translateY(-8px) scaleX(1.5); opacity: 0; }
        }
        .animate-steam {
          animation: steam 2s ease-out infinite;
        }
      `}</style>
    </div>
  );
};
