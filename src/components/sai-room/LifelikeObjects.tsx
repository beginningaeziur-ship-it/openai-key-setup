import React from 'react';
import { cn } from '@/lib/utils';
import { Wind, Target, Coffee, Search, Settings, Flame } from 'lucide-react';

interface ObjectProps {
  id: string;
  isActive: boolean;
  onClick: () => void;
  isHighlighted?: boolean;
}

// Cozy Rug - for grounding
export const RugObject: React.FC<ObjectProps> = ({ isActive, onClick, isHighlighted }) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative cursor-pointer transition-all duration-300",
      isHighlighted && "scale-110"
    )}
  >
    {/* Highlight glow when in tutorial */}
    {isHighlighted && (
      <div className="absolute -inset-4 bg-primary/30 rounded-full blur-xl animate-pulse" />
    )}
    {/* Rug shape */}
    <div className={cn(
      "w-40 h-24 rounded-[60%] relative overflow-hidden",
      "bg-gradient-to-br from-rose-900/50 via-rose-800/40 to-rose-950/50",
      "border border-rose-700/30",
      "shadow-lg shadow-rose-950/30",
      "transition-all duration-300",
      "group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-rose-900/40",
      isActive && "ring-2 ring-primary/50 scale-105",
      isHighlighted && "ring-4 ring-primary shadow-2xl shadow-primary/50"
    )}>
      {/* Rug pattern - more detailed */}
      <div className="absolute inset-2 border-2 border-rose-600/25 rounded-[50%]" />
      <div className="absolute inset-4 border border-rose-500/20 rounded-[45%]" />
      <div className="absolute inset-6 border border-rose-600/15 rounded-[40%]" />
      {/* Center medallion */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-8 bg-rose-700/20 rounded-full" />
      {/* Fringe edges */}
      <div className="absolute bottom-0 left-2 right-2 h-2 flex gap-0.5">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="flex-1 h-full bg-rose-800/30 rounded-b" />
        ))}
      </div>
      <div className="absolute top-0 left-2 right-2 h-2 flex gap-0.5">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="flex-1 h-full bg-rose-800/30 rounded-t" />
        ))}
      </div>
    </div>
    {/* Label */}
    <div className={cn(
      "absolute -bottom-8 left-1/2 -translate-x-1/2",
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
      "bg-black/60 backdrop-blur-md border border-white/10",
      "transition-all duration-300",
      (isActive || isHighlighted) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
    )}>
      <Wind className="w-3 h-3 text-primary" />
      <span className="text-xs text-white/90">Grounding</span>
    </div>
  </button>
);

// Notebook - for goals
export const NotebookObject: React.FC<ObjectProps> = ({ isActive, onClick, isHighlighted }) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative cursor-pointer transition-all duration-300",
      isHighlighted && "scale-110"
    )}
  >
    {/* Highlight glow when in tutorial */}
    {isHighlighted && (
      <div className="absolute -inset-4 bg-primary/30 rounded-xl blur-xl animate-pulse" />
    )}
    <div className={cn(
      "w-18 h-22 relative",
      "transition-all duration-300",
      "group-hover:scale-110 group-hover:-translate-y-1",
      isActive && "scale-110 -translate-y-1",
      isHighlighted && "ring-2 ring-primary/60"
    )}>
      {/* Notebook cover - leather texture */}
      <div className="absolute inset-0 w-16 h-20 bg-gradient-to-br from-amber-800/80 to-amber-950/90 rounded-sm shadow-lg" />
      {/* Leather texture lines */}
      <div className="absolute top-2 left-3 right-2 h-px bg-amber-700/20" />
      <div className="absolute top-4 left-3 right-2 h-px bg-amber-700/15" />
      {/* Spine with stitching */}
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-amber-900/90 to-amber-800/70 rounded-l-sm">
        <div className="absolute top-2 left-1 w-1 h-1 bg-amber-600/40 rounded-full" />
        <div className="absolute top-5 left-1 w-1 h-1 bg-amber-600/40 rounded-full" />
        <div className="absolute top-8 left-1 w-1 h-1 bg-amber-600/40 rounded-full" />
        <div className="absolute top-11 left-1 w-1 h-1 bg-amber-600/40 rounded-full" />
        <div className="absolute top-14 left-1 w-1 h-1 bg-amber-600/40 rounded-full" />
      </div>
      {/* Pages visible */}
      <div className="absolute inset-y-1 left-3 right-0 w-12 bg-amber-100/25 rounded-r-sm" />
      {/* Written lines on page */}
      <div className="absolute top-3 left-4 right-1 space-y-1.5">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-px bg-amber-200/25" style={{ width: `${60 + Math.random() * 30}%` }} />
        ))}
      </div>
      {/* Ribbon bookmark */}
      <div className="absolute top-0 right-3 w-2 h-10 bg-gradient-to-b from-rose-600/70 to-rose-500/50 rounded-b shadow-sm" />
      {/* Pen resting on notebook */}
      <div className="absolute -bottom-1 -right-2 w-14 h-1.5 bg-gradient-to-r from-slate-700/60 to-slate-600/40 rounded-full transform rotate-[-15deg]" />
      <div className="absolute -bottom-1.5 right-8 w-3 h-2 bg-amber-500/50 rounded-sm transform rotate-[-15deg]" />
    </div>
    {/* Label */}
    <div className={cn(
      "absolute -bottom-10 left-1/2 -translate-x-1/2",
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
      "bg-black/60 backdrop-blur-md border border-white/10",
      "transition-all duration-300 whitespace-nowrap",
      (isActive || isHighlighted) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
    )}>
      <Target className="w-3 h-3 text-primary" />
      <span className="text-xs text-white/90">Goals</span>
    </div>
  </button>
);

// Coffee Table with items
export const CoffeeTableObject: React.FC<ObjectProps> = ({ isActive, onClick, isHighlighted }) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative cursor-pointer transition-all duration-300",
      isHighlighted && "scale-110"
    )}
  >
    {/* Highlight glow when in tutorial */}
    {isHighlighted && (
      <div className="absolute -inset-4 bg-primary/30 rounded-xl blur-xl animate-pulse" />
    )}
    <div className={cn(
      "w-32 h-16 relative",
      "transition-all duration-300",
      "group-hover:scale-105",
      isActive && "scale-105",
      isHighlighted && "ring-2 ring-primary/60 rounded-lg"
    )}>
      {/* Table top - wood grain */}
      <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-amber-800/70 to-amber-900/60 rounded-t-lg shadow-lg">
        {/* Wood grain lines */}
        <div className="absolute top-1 left-2 right-2 h-px bg-amber-700/30" />
        <div className="absolute top-2 left-4 right-4 h-px bg-amber-700/20" />
      </div>
      {/* Table edge */}
      <div className="absolute top-3 inset-x-1 h-2 bg-amber-950/50 rounded" />
      {/* Legs */}
      <div className="absolute bottom-0 left-3 w-2.5 h-9 bg-gradient-to-b from-amber-900/60 to-amber-950/50 rounded-b" />
      <div className="absolute bottom-0 right-3 w-2.5 h-9 bg-gradient-to-b from-amber-900/60 to-amber-950/50 rounded-b" />
      {/* Items on table */}
      {/* Book */}
      <div className="absolute -top-3 left-5 w-6 h-4 bg-gradient-to-r from-slate-600/50 to-slate-700/40 rounded-sm" />
      <div className="absolute -top-3.5 left-5.5 w-5 h-3.5 bg-slate-500/40 rounded-sm" />
      {/* Coffee mug */}
      <div className="absolute -top-4 right-8 w-5 h-6 bg-gradient-to-b from-slate-500/40 to-slate-600/30 rounded-b-lg rounded-t-sm" />
      <div className="absolute -top-4 right-6 w-2 h-3 border-2 border-slate-500/30 rounded-r-full" />
      {/* Steam from mug */}
      <div className="absolute -top-7 right-9 w-3 h-4 opacity-50">
        <div className="absolute bottom-0 left-0 w-1 h-3 bg-white/20 rounded-full blur-sm animate-float" style={{ animationDuration: '2s' }} />
        <div className="absolute bottom-0 right-0 w-1 h-2 bg-white/15 rounded-full blur-sm animate-float" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
      </div>
      {/* Coaster */}
      <div className="absolute -top-1 right-7 w-7 h-7 bg-amber-900/30 rounded-full" />
      {/* Small plant */}
      <div className="absolute -top-5 left-14 w-4 h-5">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-2 bg-orange-900/40 rounded-b rounded-t-sm" />
        <div className="absolute bottom-1.5 left-0 w-3 h-2 bg-emerald-700/40 rounded-full rotate-[-30deg]" />
        <div className="absolute bottom-2 right-0 w-2.5 h-1.5 bg-emerald-700/35 rounded-full rotate-[30deg]" />
      </div>
    </div>
    {/* Label */}
    <div className={cn(
      "absolute -bottom-6 left-1/2 -translate-x-1/2",
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
      "bg-black/60 backdrop-blur-md border border-white/10",
      "transition-all duration-300 whitespace-nowrap",
      (isActive || isHighlighted) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
    )}>
      <Coffee className="w-3 h-3 text-primary" />
      <span className="text-xs text-white/90">Daily Tools</span>
    </div>
  </button>
);

// Bookshelf
export const BookshelfObject: React.FC<ObjectProps> = ({ isActive, onClick, isHighlighted }) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative cursor-pointer transition-all duration-300",
      isHighlighted && "scale-110"
    )}
  >
    {/* Highlight glow when in tutorial */}
    {isHighlighted && (
      <div className="absolute -inset-4 bg-primary/30 rounded-xl blur-xl animate-pulse" />
    )}
    <div className={cn(
      "w-24 h-40 relative",
      "transition-all duration-300",
      "group-hover:scale-105",
      isActive && "scale-105",
      isHighlighted && "ring-2 ring-primary/60 rounded"
    )}>
      {/* Shelf frame */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/70 to-amber-950/80 rounded shadow-lg" />
      {/* Back panel */}
      <div className="absolute inset-1 bg-amber-950/40" />
      {/* Shelves */}
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="absolute inset-x-0 h-1 bg-amber-800/60 shadow" style={{ top: `${20 + i * 22}%` }} />
      ))}
      {/* Books - top shelf */}
      <div className="absolute top-2 left-2 w-4 h-7 bg-gradient-to-b from-rose-800/60 to-rose-900/50 rounded-sm" />
      <div className="absolute top-2 left-7 w-3 h-6 bg-gradient-to-b from-blue-800/60 to-blue-900/50 rounded-sm" />
      <div className="absolute top-3 left-11 w-4 h-6 bg-gradient-to-b from-emerald-800/60 to-emerald-900/50 rounded-sm" />
      <div className="absolute top-2 left-16 w-3 h-7 bg-gradient-to-b from-amber-700/60 to-amber-800/50 rounded-sm" />
      {/* Books - second shelf */}
      <div className="absolute top-[25%] left-3 w-5 h-6 bg-gradient-to-b from-purple-800/60 to-purple-900/50 rounded-sm" />
      <div className="absolute top-[26%] left-9 w-4 h-5 bg-gradient-to-b from-cyan-800/60 to-cyan-900/50 rounded-sm" />
      <div className="absolute top-[24%] left-14 w-3 h-7 bg-gradient-to-b from-rose-700/60 to-rose-800/50 rounded-sm" />
      {/* Books - third shelf */}
      <div className="absolute top-[47%] left-2 w-4 h-6 bg-gradient-to-b from-slate-600/60 to-slate-700/50 rounded-sm" />
      <div className="absolute top-[48%] left-7 w-5 h-5 bg-gradient-to-b from-amber-600/60 to-amber-700/50 rounded-sm" />
      <div className="absolute top-[46%] left-13 w-4 h-7 bg-gradient-to-b from-indigo-700/60 to-indigo-800/50 rounded-sm" />
      {/* Bottom shelf - lying book and decorative item */}
      <div className="absolute top-[70%] left-3 w-8 h-4 bg-gradient-to-r from-slate-600/50 to-slate-700/40 rounded-sm" />
      <div className="absolute top-[68%] left-14 w-5 h-6 bg-gradient-to-b from-orange-900/40 to-orange-950/30 rounded-full" /> {/* Vase */}
    </div>
    {/* Label */}
    <div className={cn(
      "absolute -bottom-8 left-1/2 -translate-x-1/2",
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
      "bg-black/60 backdrop-blur-md border border-white/10",
      "transition-all duration-300 whitespace-nowrap",
      (isActive || isHighlighted) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
    )}>
      <Search className="w-3 h-3 text-primary" />
      <span className="text-xs text-white/90">Resources</span>
    </div>
  </button>
);

// Standing Lamp
export const LampObject: React.FC<ObjectProps> = ({ isActive, onClick, isHighlighted }) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative cursor-pointer transition-all duration-300",
      isHighlighted && "scale-110"
    )}
  >
    {/* Highlight glow when in tutorial */}
    {isHighlighted && (
      <div className="absolute -inset-4 bg-primary/30 rounded-full blur-xl animate-pulse" />
    )}
    <div className={cn(
      "w-16 h-44 relative",
      "transition-all duration-300",
      "group-hover:scale-105",
      isActive && "scale-105",
      isHighlighted && "ring-2 ring-primary/60 rounded-full"
    )}>
      {/* Base - decorative */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-3 bg-gradient-to-t from-amber-900/70 to-amber-800/50 rounded-full" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-6 h-2 bg-amber-800/60 rounded-full" />
      {/* Pole with decorative rings */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-2 h-30 bg-gradient-to-t from-amber-900/70 to-amber-800/50" />
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-3 h-1 bg-amber-700/50 rounded-full" />
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-3 h-1 bg-amber-700/50 rounded-full" />
      {/* Shade - fabric texture */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-12 bg-gradient-to-b from-amber-100/35 via-amber-200/25 to-amber-300/20 rounded-t-full rounded-b-lg" />
      {/* Shade pleats */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-10 overflow-hidden rounded-t-full">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute h-full w-px bg-amber-300/10" style={{ left: `${15 + i * 14}%` }} />
        ))}
      </div>
      {/* Bulb glow */}
      <div className={cn(
        "absolute top-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-amber-100/40 rounded-full blur-md",
        "transition-opacity duration-300",
        isActive ? "opacity-100" : "opacity-70"
      )} />
      {/* Light spread */}
      <div className={cn(
        "absolute top-2 left-1/2 -translate-x-1/2 w-24 h-24 bg-amber-200/15 rounded-full blur-2xl",
        "transition-opacity duration-300",
        isActive ? "opacity-100" : "opacity-40"
      )} />
      {/* Light cone on floor */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-amber-200/8 rounded-full blur-xl" />
    </div>
    {/* Label */}
    <div className={cn(
      "absolute -bottom-8 left-1/2 -translate-x-1/2",
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
      "bg-black/60 backdrop-blur-md border border-white/10",
      "transition-all duration-300 whitespace-nowrap",
      (isActive || isHighlighted) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
    )}>
      <Settings className="w-3 h-3 text-primary" />
      <span className="text-xs text-white/90">Settings</span>
    </div>
  </button>
);

// Fireplace
export const FireplaceObject: React.FC<ObjectProps> = ({ isActive, onClick, isHighlighted }) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative cursor-pointer transition-all duration-300",
      isHighlighted && "scale-110"
    )}
  >
    {/* Highlight glow when in tutorial */}
    {isHighlighted && (
      <div className="absolute -inset-4 bg-primary/30 rounded-xl blur-xl animate-pulse" />
    )}
    <div className={cn(
      "w-36 h-32 relative",
      "transition-all duration-300",
      "group-hover:scale-105",
      isActive && "scale-105",
      isHighlighted && "ring-2 ring-primary/60 rounded-xl"
    )}>
      {/* Stone frame */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-stone-800/60 rounded-t-2xl" />
      {/* Stone texture */}
      <div className="absolute inset-1 rounded-t-xl overflow-hidden opacity-30">
        <div className="absolute top-2 left-4 w-8 h-6 bg-stone-700/50 rounded" />
        <div className="absolute top-2 right-4 w-6 h-5 bg-stone-700/40 rounded" />
        <div className="absolute top-10 left-8 w-7 h-5 bg-stone-700/30 rounded" />
      </div>
      {/* Mantle - detailed wood */}
      <div className="absolute top-0 -inset-x-3 h-5 bg-gradient-to-b from-amber-800/70 to-amber-900/60 rounded-t shadow-lg" />
      <div className="absolute top-1 -inset-x-2 h-3 bg-amber-900/40 rounded" />
      {/* Opening arch */}
      <div className="absolute bottom-0 left-5 right-5 h-18 bg-stone-950/90 rounded-t-xl" />
      {/* Inner depth */}
      <div className="absolute bottom-0 left-6 right-6 h-16 bg-black/80 rounded-t-lg" />
      {/* Fire logs */}
      <div className="absolute bottom-2 left-8 right-8 h-3">
        <div className="absolute bottom-0 left-0 w-8 h-2 bg-amber-950/70 rounded-full rotate-[-5deg]" />
        <div className="absolute bottom-0 right-0 w-7 h-2 bg-amber-950/60 rounded-full rotate-[5deg]" />
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-amber-900/50 rounded-full" />
      </div>
      {/* Fire flames - animated */}
      <div className="absolute bottom-4 left-7 right-7 h-12 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-10 bg-gradient-to-t from-orange-600/70 via-orange-500/50 to-transparent rounded-full blur-sm animate-pulse" style={{ animationDuration: '1.5s' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-[40%] w-10 h-12 bg-gradient-to-t from-yellow-500/60 via-orange-400/40 to-transparent rounded-full blur-sm animate-pulse" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-[60%] w-8 h-9 bg-gradient-to-t from-red-600/60 via-red-500/40 to-transparent rounded-full blur-sm animate-pulse" style={{ animationDuration: '1.8s', animationDelay: '0.5s' }} />
        {/* Bright core */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-4 bg-yellow-300/40 rounded-full blur-md animate-pulse" style={{ animationDuration: '0.8s' }} />
      </div>
      {/* Fire glow on surroundings */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-12 bg-orange-500/15 rounded-full blur-2xl" />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32 h-20 bg-orange-400/8 rounded-full blur-xl" />
      {/* Decorations on mantle */}
      <div className="absolute -top-6 left-5 w-6 h-7 border-2 border-amber-800/40 bg-slate-700/30 rounded" /> {/* Frame */}
      <div className="absolute -top-5 right-6 w-4 h-5 bg-gradient-to-t from-slate-600/40 to-slate-500/20 rounded-full" /> {/* Vase */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-3 bg-amber-900/40 rounded" /> {/* Candle holder */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-1.5 h-4 bg-amber-100/40 rounded-t" /> {/* Candle */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-300/50 rounded-full blur-sm animate-pulse" /> {/* Flame */}
    </div>
    {/* Label */}
    <div className={cn(
      "absolute -bottom-8 left-1/2 -translate-x-1/2",
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
      "bg-black/60 backdrop-blur-md border border-white/10",
      "transition-all duration-300 whitespace-nowrap",
      (isActive || isHighlighted) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
    )}>
      <Flame className="w-3 h-3 text-primary" />
      <span className="text-xs text-white/90">Comfort</span>
    </div>
  </button>
);