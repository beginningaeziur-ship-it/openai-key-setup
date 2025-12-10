import React from 'react';
import { cn } from '@/lib/utils';

interface RealisticBedroomSceneProps {
  className?: string;
  showRain?: boolean;
}

/**
 * A realistic bedroom scene with:
 * - Bed with detailed bedding
 * - Clock on wall
 * - Desk with lamp
 * - Cozy rug
 * - Coffee table
 * - Rain visible/audible outside window
 */
export const RealisticBedroomScene: React.FC<RealisticBedroomSceneProps> = ({
  className,
  showRain = true,
}) => {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Base gradient - night atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#12121f] via-[#1a1a2e] to-[#0f0f1a]" />

      {/* Window with rain outside */}
      <div className="absolute top-8 right-8 w-44 h-64">
        {/* Window frame - wooden */}
        <div className="absolute inset-0 rounded-lg border-8 border-amber-900/60 bg-gradient-to-b from-slate-800/50 via-slate-700/40 to-slate-800/60 shadow-inner overflow-hidden">
          {/* Window panes */}
          <div className="absolute top-0 bottom-0 left-1/2 w-2 -translate-x-1/2 bg-amber-900/50" />
          <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 bg-amber-900/50" />
          
          {/* Rain drops on window */}
          {showRain && (
            <>
              {[...Array(30)].map((_, i) => (
                <div
                  key={`rain-${i}`}
                  className="absolute w-0.5 bg-blue-300/30 rounded-full animate-rain"
                  style={{
                    left: `${5 + Math.random() * 90}%`,
                    height: `${8 + Math.random() * 15}px`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                  }}
                />
              ))}
              {/* Rain streaks on glass */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={`streak-${i}`}
                  className="absolute w-px bg-gradient-to-b from-blue-200/20 via-blue-300/10 to-transparent"
                  style={{
                    left: `${10 + i * 12}%`,
                    top: `${10 + Math.random() * 30}%`,
                    height: `${30 + Math.random() * 40}%`,
                  }}
                />
              ))}
            </>
          )}
          
          {/* Distant city lights (blurred) */}
          <div className="absolute bottom-4 left-2 w-3 h-2 bg-amber-400/15 rounded blur-sm" />
          <div className="absolute bottom-6 right-4 w-2 h-3 bg-amber-300/10 rounded blur-sm" />
          <div className="absolute bottom-3 left-1/2 w-4 h-2 bg-blue-400/10 rounded blur-md" />
        </div>
        
        {/* Curtains - heavy drapes */}
        <div className="absolute -top-2 -left-4 w-8 h-72 bg-gradient-to-b from-indigo-900/70 via-indigo-950/60 to-indigo-900/50 rounded-b-lg shadow-lg" />
        <div className="absolute -top-2 -right-4 w-8 h-72 bg-gradient-to-b from-indigo-900/70 via-indigo-950/60 to-indigo-900/50 rounded-b-lg shadow-lg" />
        {/* Curtain rod */}
        <div className="absolute -top-3 -left-6 w-60 h-2 bg-amber-800/70 rounded-full shadow" />
        <div className="absolute -top-4 -left-8 w-3 h-3 bg-amber-700/80 rounded-full" />
        <div className="absolute -top-4 right-[calc(-2rem-4px)] w-3 h-3 bg-amber-700/80 rounded-full" />
      </div>

      {/* Wall clock */}
      <div className="absolute top-16 left-1/4 w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-amber-800/50 bg-slate-800/40 shadow-lg">
          {/* Clock face */}
          <div className="absolute inset-2 rounded-full bg-slate-100/10">
            {/* Hour markers */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-1.5 bg-amber-100/40 rounded-full"
                style={{
                  left: '50%',
                  top: '8%',
                  transformOrigin: '50% 400%',
                  transform: `translateX(-50%) rotate(${i * 30}deg)`,
                }}
              />
            ))}
            {/* Clock hands */}
            <div 
              className="absolute w-0.5 h-4 bg-amber-100/60 rounded-full"
              style={{ left: '50%', bottom: '50%', transformOrigin: 'bottom center', transform: 'translateX(-50%) rotate(45deg)' }}
            />
            <div 
              className="absolute w-0.5 h-3 bg-amber-200/80 rounded-full"
              style={{ left: '50%', bottom: '50%', transformOrigin: 'bottom center', transform: 'translateX(-50%) rotate(-30deg)' }}
            />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-amber-300/60 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Bed - left side */}
      <div className="absolute bottom-16 left-[3%] w-[35%] h-36">
        {/* Headboard */}
        <div className="absolute bottom-28 w-full h-28 bg-gradient-to-t from-amber-950/60 via-amber-900/50 to-amber-800/40 rounded-t-2xl shadow-lg">
          {/* Headboard details/tufting */}
          <div className="absolute inset-4 border-2 border-amber-700/30 rounded-t-xl" />
          <div className="absolute top-6 left-[20%] w-3 h-3 rounded-full bg-amber-700/30" />
          <div className="absolute top-6 right-[20%] w-3 h-3 rounded-full bg-amber-700/30" />
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-700/30" />
        </div>
        
        {/* Bed frame */}
        <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-amber-950/70 to-amber-900/50 rounded-b shadow-lg" />
        
        {/* Mattress */}
        <div className="absolute bottom-7 w-full h-10 bg-gradient-to-t from-slate-700/40 to-slate-600/25 rounded-t" />
        
        {/* Comforter - rich blue */}
        <div className="absolute bottom-12 w-[98%] left-[1%] h-20 bg-gradient-to-t from-indigo-900/50 via-indigo-800/40 to-indigo-700/30 rounded-t-xl shadow-inner">
          {/* Comforter folds */}
          <div className="absolute bottom-2 left-[15%] w-[30%] h-8 bg-indigo-950/20 rounded-full blur-sm" />
          <div className="absolute bottom-4 right-[20%] w-[25%] h-6 bg-indigo-950/15 rounded-full blur-sm" />
        </div>
        
        {/* Pillows */}
        <div className="absolute bottom-24 left-[8%] w-[25%] h-10 bg-gradient-to-t from-slate-300/30 to-slate-200/20 rounded-xl shadow-inner" />
        <div className="absolute bottom-25 left-[38%] w-[25%] h-11 bg-gradient-to-t from-slate-300/25 to-slate-200/15 rounded-xl shadow-inner" />
        <div className="absolute bottom-24 right-[12%] w-[20%] h-9 bg-gradient-to-t from-slate-300/20 to-slate-200/12 rounded-xl shadow-inner" />
      </div>

      {/* Nightstand with lamp */}
      <div className="absolute bottom-14 left-[40%] w-14 h-18">
        <div className="absolute bottom-0 w-full h-14 bg-gradient-to-t from-amber-950/60 to-amber-900/40 rounded-sm shadow-lg">
          {/* Drawer */}
          <div className="absolute top-3 left-2 right-2 h-5 border border-amber-800/30 rounded-sm" />
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-4 h-1 bg-amber-600/40 rounded" />
        </div>
        
        {/* Table lamp */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
          <div className="w-8 h-6 bg-gradient-to-t from-amber-100/30 to-amber-50/20 rounded-t-full border-b border-amber-200/20" />
          <div className="w-3 h-5 bg-amber-900/50 mx-auto" />
          <div className="w-5 h-1.5 bg-amber-900/60 rounded-full mx-auto" />
          {/* Lamp glow */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-16 bg-amber-200/15 rounded-full blur-xl" />
        </div>
      </div>

      {/* Desk area - right side */}
      <div className="absolute bottom-12 right-[18%] w-28 h-28">
        {/* Desk */}
        <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-amber-950/50 to-amber-900/35 rounded-t shadow-lg">
          {/* Desk legs */}
          <div className="absolute bottom-0 left-2 w-2 h-16 bg-amber-950/60" />
          <div className="absolute bottom-0 right-2 w-2 h-16 bg-amber-950/60" />
          {/* Desk surface */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-amber-800/40 rounded-t" />
        </div>
        
        {/* Chair */}
        <div className="absolute bottom-0 -left-8 w-12 h-16">
          <div className="absolute bottom-0 w-full h-3 bg-slate-800/40 rounded" />
          <div className="absolute bottom-2 w-full h-6 bg-slate-700/35 rounded-t" />
          <div className="absolute bottom-7 left-[20%] w-[60%] h-10 bg-slate-700/40 rounded-t-lg" />
        </div>
        
        {/* Desk lamp */}
        <div className="absolute -top-4 right-2">
          <div className="w-6 h-4 bg-slate-600/40 rounded-full" />
          <div className="w-1 h-6 bg-slate-500/50 mx-auto" />
          <div className="w-4 h-1 bg-slate-600/60 rounded mx-auto" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-8 bg-amber-200/8 rounded-full blur-lg" />
        </div>
        
        {/* Items on desk */}
        <div className="absolute -top-1 left-4 w-8 h-6 bg-slate-600/30 rounded-sm" /> {/* Monitor/book */}
        <div className="absolute -top-0.5 left-14 w-3 h-4 bg-amber-100/20 rounded-sm" /> {/* Paper */}
      </div>

      {/* Cozy rug - center floor */}
      <div className="absolute bottom-6 left-[30%] w-[40%] h-16">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-900/30 via-rose-800/40 to-rose-900/30 rounded-[50%] shadow-inner">
          {/* Rug pattern */}
          <div className="absolute inset-4 border-2 border-rose-700/20 rounded-[50%]" />
          <div className="absolute inset-8 border border-rose-600/15 rounded-[50%]" />
        </div>
      </div>

      {/* Coffee table on rug */}
      <div className="absolute bottom-8 left-[42%] w-20 h-8">
        <div className="absolute bottom-0 w-full h-6 bg-gradient-to-t from-amber-950/50 to-amber-900/35 rounded shadow-lg">
          {/* Table legs */}
          <div className="absolute bottom-0 left-2 w-1.5 h-4 bg-amber-950/70" />
          <div className="absolute bottom-0 right-2 w-1.5 h-4 bg-amber-950/70" />
        </div>
        {/* Items on table */}
        <div className="absolute -top-1 left-3 w-5 h-3 bg-teal-800/30 rounded-sm" /> {/* Book */}
        <div className="absolute -top-0.5 right-4 w-3 h-3 rounded-full bg-slate-400/20" /> {/* Mug */}
      </div>

      {/* Floor - wooden planks */}
      <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0 h-full"
            style={{ left: `${i * 5}%`, width: '5%' }}
          >
            <div className="h-full bg-gradient-to-r from-amber-950/40 via-amber-900/25 to-amber-950/35 border-r border-amber-800/15" />
          </div>
        ))}
      </div>

      {/* Ambient lighting effects */}
      <div className="absolute top-1/4 left-1/3 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-indigo-500/3 rounded-full blur-3xl" />

      {/* Floating dust particles */}
      {[...Array(25)].map((_, i) => (
        <div
          key={`dust-${i}`}
          className="absolute w-0.5 h-0.5 bg-white/10 rounded-full animate-float"
          style={{
            left: `${5 + Math.random() * 90}%`,
            top: `${10 + Math.random() * 70}%`,
            animationDelay: `${i * 0.3}s`,
            animationDuration: `${4 + Math.random() * 4}s`,
          }}
        />
      ))}

      {/* Rain animation keyframes are in index.css */}
      <style>{`
        @keyframes rain {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(400%); opacity: 0; }
        }
        .animate-rain {
          animation: rain linear infinite;
        }
      `}</style>
    </div>
  );
};
