import React from 'react';
import { cn } from '@/lib/utils';

interface RealisticOceanSceneProps {
  className?: string;
}

/**
 * A realistic beach scene with:
 * - Sandy beach
 * - Beach chair
 * - Small table with drink
 * - Ocean waves
 * - Sunset/sunrise atmosphere
 */
export const RealisticOceanScene: React.FC<RealisticOceanSceneProps> = ({
  className,
}) => {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Sky gradient - sunset colors */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a3a5c] via-[#2d5a7b] to-[#f4a460]" />
      
      {/* Sun glow on horizon */}
      <div className="absolute bottom-[38%] left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-t from-orange-400/40 via-amber-300/20 to-transparent rounded-full blur-2xl" />
      
      {/* Clouds */}
      <div className="absolute top-[8%] left-[10%] w-40 h-12 bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-full blur-xl" />
      <div className="absolute top-[12%] right-[15%] w-32 h-10 bg-gradient-to-r from-transparent via-white/12 to-transparent rounded-full blur-xl" />
      <div className="absolute top-[5%] left-1/2 w-48 h-8 bg-gradient-to-r from-transparent via-orange-200/10 to-transparent rounded-full blur-xl" />

      {/* Ocean - multiple wave layers */}
      <div className="absolute bottom-[30%] left-0 right-0 h-[25%]">
        {/* Deep water */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a4d68] to-[#1a6b8a]" />
        
        {/* Wave reflections */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={`reflection-${i}`}
              className="absolute h-1 bg-gradient-to-r from-transparent via-amber-300/20 to-transparent rounded-full animate-wave"
              style={{
                top: `${10 + i * 12}%`,
                left: `${-20 + i * 5}%`,
                right: `${-20 + i * 5}%`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
        
        {/* Waves */}
        <svg className="absolute bottom-0 left-0 right-0 h-16" viewBox="0 0 1200 80" preserveAspectRatio="none">
          <path
            d="M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 L1200,80 L0,80 Z"
            fill="rgba(26,107,138,0.7)"
            className="animate-wave-path"
          />
          <path
            d="M0,50 C200,70 400,30 600,50 C800,70 1000,30 1200,50 L1200,80 L0,80 Z"
            fill="rgba(34,139,170,0.6)"
            className="animate-wave-path-2"
          />
        </svg>
      </div>

      {/* Shore/wet sand line */}
      <div className="absolute bottom-[28%] left-0 right-0 h-4 bg-gradient-to-b from-[#1a6b8a]/50 to-[#c4a574]" />

      {/* Beach sand */}
      <div className="absolute bottom-0 left-0 right-0 h-[32%] bg-gradient-to-b from-[#d4b896] via-[#c4a574] to-[#b89560]">
        {/* Sand texture */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(50)].map((_, i) => (
            <div
              key={`sand-${i}`}
              className="absolute w-0.5 h-0.5 bg-amber-950/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
        
        {/* Footprints suggestion */}
        <div className="absolute bottom-[40%] right-[30%] w-2 h-4 bg-amber-900/10 rounded-full rotate-12" />
        <div className="absolute bottom-[35%] right-[28%] w-2 h-4 bg-amber-900/10 rounded-full -rotate-6" />
      </div>

      {/* Beach chair - left side */}
      <div className="absolute bottom-[12%] left-[15%] w-28 h-36">
        {/* Chair frame */}
        <div className="absolute bottom-0 w-full h-28">
          {/* Back legs */}
          <div className="absolute bottom-0 left-2 w-2 h-24 bg-amber-900/70 rounded transform -rotate-12 origin-bottom" />
          <div className="absolute bottom-0 right-6 w-2 h-24 bg-amber-900/70 rounded transform -rotate-12 origin-bottom" />
          {/* Front legs */}
          <div className="absolute bottom-0 left-6 w-2 h-10 bg-amber-900/60 rounded" />
          <div className="absolute bottom-0 right-10 w-2 h-10 bg-amber-900/60 rounded" />
          
          {/* Seat fabric */}
          <div className="absolute bottom-8 left-4 w-20 h-20 transform -rotate-12 origin-bottom-left">
            <div className="w-full h-full bg-gradient-to-b from-blue-600/70 via-blue-500/60 to-blue-600/50 rounded-t-lg">
              {/* Stripes */}
              <div className="absolute inset-0 overflow-hidden rounded-t-lg">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full h-3 bg-white/30"
                    style={{ top: `${i * 20}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Armrests */}
          <div className="absolute bottom-14 left-2 w-4 h-2 bg-amber-800/60 rounded" />
          <div className="absolute bottom-14 right-4 w-4 h-2 bg-amber-800/60 rounded" />
        </div>
        
        {/* Beach towel on chair */}
        <div className="absolute bottom-10 left-6 w-16 h-2 bg-gradient-to-r from-orange-500/50 via-yellow-400/40 to-orange-500/50 rounded" />
      </div>

      {/* Small side table */}
      <div className="absolute bottom-[10%] left-[40%] w-14 h-12">
        {/* Table top */}
        <div className="absolute top-0 w-full h-2 bg-amber-100/80 rounded-full shadow" />
        {/* Table leg */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-8 bg-amber-100/70 rounded" />
        {/* Base */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-amber-100/60 rounded-full" />
        
        {/* Drink with umbrella */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2">
          <div className="w-5 h-6 bg-gradient-to-b from-amber-200/70 to-amber-300/60 rounded-b-lg rounded-t-sm">
            {/* Drink color */}
            <div className="absolute inset-1 bg-orange-400/50 rounded-b" />
            {/* Ice */}
            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/40 rounded-sm" />
          </div>
          {/* Umbrella */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <div className="w-6 h-3 bg-gradient-to-b from-pink-500/70 to-pink-600/60 rounded-t-full" />
            <div className="w-0.5 h-5 bg-amber-800/60 mx-auto" />
          </div>
          {/* Straw */}
          <div className="absolute -top-1 right-0 w-0.5 h-6 bg-red-400/70 rounded-full" />
        </div>
      </div>

      {/* Beach umbrella - far right */}
      <div className="absolute bottom-[8%] right-[18%]">
        {/* Umbrella canopy */}
        <div className="absolute -top-32 w-32 h-20 bg-gradient-to-b from-red-500/60 via-red-600/50 to-red-500/40 rounded-t-full">
          {/* Umbrella segments */}
          <div className="absolute inset-0 overflow-hidden rounded-t-full">
            <div className="absolute top-0 left-0 w-1/4 h-full bg-white/30" />
            <div className="absolute top-0 left-1/2 w-1/4 h-full bg-white/30" />
          </div>
          {/* Fringe */}
          <div className="absolute bottom-0 left-0 right-0 h-2 flex justify-around">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-3 h-2 bg-red-600/40 rounded-b-full" />
            ))}
          </div>
        </div>
        {/* Pole */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-2 h-16 bg-amber-100/70 rounded" />
      </div>

      {/* Seashells and details */}
      <div className="absolute bottom-[6%] left-[55%] w-3 h-3 bg-pink-200/40 rounded-full" />
      <div className="absolute bottom-[4%] left-[60%] w-2 h-2 bg-amber-100/30 rounded-full" />
      <div className="absolute bottom-[8%] right-[40%] w-4 h-2 bg-rose-200/25 rounded-t-full" />

      {/* Starfish */}
      <div className="absolute bottom-[5%] left-[25%] w-6 h-6 text-orange-400/50 text-2xl">⭐</div>

      {/* Palm tree shadow suggestion */}
      <div className="absolute bottom-[15%] right-[5%] w-24 h-40 bg-gradient-to-l from-transparent via-amber-950/10 to-transparent transform -rotate-45" />

      {/* Birds */}
      {[...Array(3)].map((_, i) => (
        <div
          key={`bird-${i}`}
          className="absolute text-slate-900/30 animate-bird"
          style={{
            top: `${10 + i * 5}%`,
            left: `${20 + i * 20}%`,
            animationDelay: `${i * 2}s`,
            fontSize: '12px',
          }}
        >
          ∿
        </div>
      ))}

      {/* Ambient lighting */}
      <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-t from-orange-300/10 to-transparent pointer-events-none" />

      {/* Animations */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(20px); }
        }
        .animate-wave {
          animation: wave 4s ease-in-out infinite;
        }
        @keyframes wave-path {
          0%, 100% { d: path("M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 L1200,80 L0,80 Z"); }
          50% { d: path("M0,50 C200,20 400,60 600,30 C800,60 1000,20 1200,50 L1200,80 L0,80 Z"); }
        }
        .animate-wave-path {
          animation: wave-path 6s ease-in-out infinite;
        }
        .animate-wave-path-2 {
          animation: wave-path 5s ease-in-out infinite reverse;
        }
        @keyframes bird {
          0%, 100% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(10px) translateY(-5px); }
          50% { transform: translateX(20px) translateY(0); }
          75% { transform: translateX(10px) translateY(5px); }
        }
        .animate-bird {
          animation: bird 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
