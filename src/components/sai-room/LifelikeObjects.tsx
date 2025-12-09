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
      isHighlighted && "animate-pulse"
    )}
  >
    {/* Rug shape */}
    <div className={cn(
      "w-40 h-24 rounded-[60%] relative overflow-hidden",
      "bg-gradient-to-br from-rose-900/50 via-rose-800/40 to-rose-950/50",
      "border border-rose-700/30",
      "shadow-lg shadow-rose-950/30",
      "transition-all duration-300",
      "group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-rose-900/40",
      isActive && "ring-2 ring-primary/50 scale-105"
    )}>
      {/* Rug pattern */}
      <div className="absolute inset-2 border border-rose-600/20 rounded-[50%]" />
      <div className="absolute inset-4 border border-rose-600/15 rounded-[50%]" />
      {/* Fringe edges */}
      <div className="absolute bottom-0 left-2 right-2 h-2 flex gap-1">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="flex-1 h-full bg-rose-800/30 rounded-b" />
        ))}
      </div>
    </div>
    {/* Label */}
    <div className={cn(
      "absolute -bottom-8 left-1/2 -translate-x-1/2",
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
      "bg-black/50 backdrop-blur-md border border-white/10",
      "opacity-0 group-hover:opacity-100 transition-opacity",
      isActive && "opacity-100"
    )}>
      <Wind className="w-3 h-3 text-primary" />
      <span className="text-xs text-white/90">Rug</span>
    </div>
  </button>
);

// Notebook - for goals
export const NotebookObject: React.FC<ObjectProps> = ({ isActive, onClick, isHighlighted }) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative cursor-pointer transition-all duration-300",
      isHighlighted && "animate-pulse"
    )}
  >
    <div className={cn(
      "w-16 h-20 relative",
      "transition-all duration-300",
      "group-hover:scale-110 group-hover:-translate-y-1",
      isActive && "scale-110 -translate-y-1"
    )}>
      {/* Notebook cover */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-800/70 to-amber-950/80 rounded-sm shadow-lg" />
      {/* Spine */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-amber-900/80 rounded-l-sm" />
      {/* Pages */}
      <div className="absolute inset-y-1 left-3 right-1 bg-amber-100/20 rounded-r-sm" />
      {/* Lines on page */}
      <div className="absolute top-3 left-4 right-2 space-y-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-px bg-amber-200/20" />
        ))}
      </div>
      {/* Ribbon bookmark */}
      <div className="absolute top-0 right-3 w-1.5 h-8 bg-rose-500/60 rounded-b" />
    </div>
    {/* Label */}
    <div className={cn(
      "absolute -bottom-8 left-1/2 -translate-x-1/2",
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
      "bg-black/50 backdrop-blur-md border border-white/10",
      "opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap",
      isActive && "opacity-100"
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
      isHighlighted && "animate-pulse"
    )}
  >
    <div className={cn(
      "w-28 h-14 relative",
      "transition-all duration-300",
      "group-hover:scale-105",
      isActive && "scale-105"
    )}>
      {/* Table top */}
      <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-b from-amber-800/60 to-amber-900/50 rounded-t-lg shadow-lg" />
      {/* Table edge */}
      <div className="absolute top-2 inset-x-1 h-2 bg-amber-950/40 rounded" />
      {/* Legs */}
      <div className="absolute bottom-0 left-2 w-2 h-8 bg-amber-900/50 rounded-b" />
      <div className="absolute bottom-0 right-2 w-2 h-8 bg-amber-900/50 rounded-b" />
      {/* Items on table */}
      <div className="absolute -top-2 left-4 w-5 h-4 bg-slate-600/40 rounded-sm" /> {/* Book */}
      <div className="absolute -top-3 right-6 w-4 h-5 bg-slate-500/30 rounded-full" /> {/* Mug */}
      <div className="absolute -top-1 right-4 w-2 h-2 bg-amber-500/30 rounded-full blur-[1px]" /> {/* Steam */}
    </div>
    {/* Label */}
    <div className={cn(
      "absolute -bottom-6 left-1/2 -translate-x-1/2",
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
      "bg-black/50 backdrop-blur-md border border-white/10",
      "opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap",
      isActive && "opacity-100"
    )}>
      <Coffee className="w-3 h-3 text-primary" />
      <span className="text-xs text-white/90">Tools</span>
    </div>
  </button>
);

// Bookshelf
export const BookshelfObject: React.FC<ObjectProps> = ({ isActive, onClick, isHighlighted }) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative cursor-pointer transition-all duration-300",
      isHighlighted && "animate-pulse"
    )}
  >
    <div className={cn(
      "w-20 h-36 relative",
      "transition-all duration-300",
      "group-hover:scale-105",
      isActive && "scale-105"
    )}>
      {/* Shelf frame */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/60 to-amber-950/70 rounded-sm shadow-lg" />
      {/* Shelves */}
      {[0, 1, 2].map((i) => (
        <div key={i} className="absolute inset-x-1 h-px bg-amber-700/50" style={{ top: `${25 + i * 25}%` }} />
      ))}
      {/* Books */}
      <div className="absolute top-2 left-2 w-3 h-6 bg-rose-800/50 rounded-sm" />
      <div className="absolute top-2 left-6 w-2.5 h-5 bg-blue-800/50 rounded-sm" />
      <div className="absolute top-2 left-9 w-3 h-7 bg-emerald-800/50 rounded-sm" />
      <div className="absolute top-[30%] left-3 w-4 h-5 bg-purple-800/50 rounded-sm" />
      <div className="absolute top-[30%] left-8 w-3 h-6 bg-amber-700/50 rounded-sm" />
      <div className="absolute top-[55%] left-2 w-3 h-5 bg-cyan-800/50 rounded-sm" />
      <div className="absolute top-[55%] left-6 w-4 h-6 bg-rose-700/50 rounded-sm" />
      <div className="absolute top-[80%] left-3 w-5 h-4 bg-slate-600/40 rounded-sm" /> {/* Lying book */}
    </div>
    {/* Label */}
    <div className={cn(
      "absolute -bottom-8 left-1/2 -translate-x-1/2",
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
      "bg-black/50 backdrop-blur-md border border-white/10",
      "opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap",
      isActive && "opacity-100"
    )}>
      <Search className="w-3 h-3 text-primary" />
      <span className="text-xs text-white/90">Research</span>
    </div>
  </button>
);

// Standing Lamp
export const LampObject: React.FC<ObjectProps> = ({ isActive, onClick, isHighlighted }) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative cursor-pointer transition-all duration-300",
      isHighlighted && "animate-pulse"
    )}
  >
    <div className={cn(
      "w-16 h-40 relative",
      "transition-all duration-300",
      "group-hover:scale-105",
      isActive && "scale-105"
    )}>
      {/* Base */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-2 bg-amber-900/60 rounded-full" />
      {/* Pole */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-28 bg-gradient-to-t from-amber-900/60 to-amber-800/40" />
      {/* Shade */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-10 bg-gradient-to-b from-amber-100/30 to-amber-200/20 rounded-t-full rounded-b-lg" />
      {/* Light glow */}
      <div className={cn(
        "absolute top-2 left-1/2 -translate-x-1/2 w-20 h-20 bg-amber-200/20 rounded-full blur-xl",
        "transition-opacity duration-300",
        isActive ? "opacity-100" : "opacity-50"
      )} />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-100/30 rounded-full blur-md" />
    </div>
    {/* Label */}
    <div className={cn(
      "absolute -bottom-8 left-1/2 -translate-x-1/2",
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
      "bg-black/50 backdrop-blur-md border border-white/10",
      "opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap",
      isActive && "opacity-100"
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
      isHighlighted && "animate-pulse"
    )}
  >
    <div className={cn(
      "w-32 h-28 relative",
      "transition-all duration-300",
      "group-hover:scale-105",
      isActive && "scale-105"
    )}>
      {/* Stone frame */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 to-stone-800/50 rounded-t-xl" />
      {/* Mantle */}
      <div className="absolute top-0 -inset-x-2 h-4 bg-gradient-to-b from-stone-700/60 to-stone-800/50 rounded-t" />
      {/* Opening */}
      <div className="absolute bottom-0 left-4 right-4 h-16 bg-stone-950/80 rounded-t-lg" />
      {/* Fire */}
      <div className="absolute bottom-2 left-6 right-6 h-10 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-8 bg-gradient-to-t from-orange-600/60 via-orange-500/40 to-transparent rounded-full blur-sm animate-pulse" style={{ animationDuration: '1.5s' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-[40%] w-8 h-10 bg-gradient-to-t from-yellow-500/50 via-orange-400/30 to-transparent rounded-full blur-sm animate-pulse" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-[60%] w-6 h-7 bg-gradient-to-t from-red-600/50 via-red-500/30 to-transparent rounded-full blur-sm animate-pulse" style={{ animationDuration: '1.8s', animationDelay: '0.5s' }} />
      </div>
      {/* Fire glow on floor */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-8 bg-orange-500/10 rounded-full blur-xl" />
      {/* Decorations on mantle */}
      <div className="absolute -top-4 left-4 w-5 h-6 bg-slate-700/40 rounded-sm" /> {/* Frame */}
      <div className="absolute -top-3 right-5 w-3 h-4 bg-slate-600/30 rounded-full" /> {/* Vase */}
    </div>
    {/* Label */}
    <div className={cn(
      "absolute -bottom-8 left-1/2 -translate-x-1/2",
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
      "bg-black/50 backdrop-blur-md border border-white/10",
      "opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap",
      isActive && "opacity-100"
    )}>
      <Flame className="w-3 h-3 text-primary" />
      <span className="text-xs text-white/90">Comfort</span>
    </div>
  </button>
);
