import React from 'react';
import { cn } from '@/lib/utils';
import { Wind, Target, Coffee, Search, Settings, Heart } from 'lucide-react';

interface WoodsWithObjectsProps {
  activeArea: string | null;
  onAreaSelect: (id: string) => void;
  highlightedObject?: string;
  isVisible?: boolean;
}

interface ObjectProps {
  id: string;
  isActive: boolean;
  onClick: () => void;
  isHighlighted?: boolean;
}

// Mossy boulder - grounding
const MossyBoulderObject: React.FC<ObjectProps> = ({ isActive, onClick, isHighlighted }) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative cursor-pointer transition-all duration-300",
      isHighlighted && "scale-110"
    )}
  >
    {isHighlighted && (
      <div className="absolute -inset-4 bg-primary/30 rounded-full blur-xl animate-pulse" />
    )}
    <div className={cn(
      "w-32 h-20 relative",
      "transition-all duration-300",
      "group-hover:scale-105",
      isActive && "scale-105",
      isHighlighted && "ring-2 ring-primary/60 rounded-[60%]"
    )}>
      {/* Main boulder */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-700/60 to-stone-600/45 rounded-[60%]" />
      {/* Stone texture */}
      <div className="absolute top-4 left-6 w-8 h-4 bg-stone-800/20 rounded-full" />
      <div className="absolute top-6 right-4 w-6 h-3 bg-stone-800/15 rounded-full" />
      {/* Moss patches */}
      <div className="absolute top-2 left-4 w-10 h-5 bg-emerald-700/40 rounded-full" />
      <div className="absolute top-0 right-6 w-8 h-4 bg-emerald-800/35 rounded-full" />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-3 bg-emerald-600/30 rounded-full" />
      {/* Small mushrooms */}
      <div className="absolute -top-2 right-8 w-2 h-3">
        <div className="w-2 h-2 bg-amber-200/50 rounded-t-full" />
        <div className="w-1 h-1.5 bg-amber-100/40 mx-auto" />
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

// Trail marker - goals
const TrailMarkerObject: React.FC<ObjectProps> = ({ isActive, onClick, isHighlighted }) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative cursor-pointer transition-all duration-300",
      isHighlighted && "scale-110"
    )}
  >
    {isHighlighted && (
      <div className="absolute -inset-4 bg-primary/30 rounded-xl blur-xl animate-pulse" />
    )}
    <div className={cn(
      "w-16 h-28 relative",
      "transition-all duration-300",
      "group-hover:scale-110 group-hover:-translate-y-1",
      isActive && "scale-110 -translate-y-1",
      isHighlighted && "ring-2 ring-primary/60"
    )}>
      {/* Wooden post */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-24 bg-gradient-to-r from-amber-800/60 to-amber-900/50 rounded" />
      {/* Wood grain */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3 space-y-2">
        <div className="h-px bg-amber-700/30" />
        <div className="h-px bg-amber-700/25" />
        <div className="h-px bg-amber-700/30" />
      </div>
      {/* Sign board */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-amber-700/55 to-amber-800/45 rounded-t" />
      {/* Arrow carved into sign */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-amber-600/40" />
      {/* Lichen */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-600/30 rounded-full" />
    </div>
    {/* Label */}
    <div className={cn(
      "absolute -bottom-8 left-1/2 -translate-x-1/2",
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

// Fallen log seat - tools
const FallenLogObject: React.FC<ObjectProps> = ({ isActive, onClick, isHighlighted }) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative cursor-pointer transition-all duration-300",
      isHighlighted && "scale-110"
    )}
  >
    {isHighlighted && (
      <div className="absolute -inset-4 bg-primary/30 rounded-xl blur-xl animate-pulse" />
    )}
    <div className={cn(
      "w-36 h-16 relative",
      "transition-all duration-300",
      "group-hover:scale-105",
      isActive && "scale-105",
      isHighlighted && "ring-2 ring-primary/60 rounded-lg"
    )}>
      {/* Main log */}
      <div className="absolute bottom-0 w-full h-10 bg-gradient-to-r from-amber-900/55 via-amber-800/50 to-amber-900/55 rounded-lg transform rotate-[-3deg]" />
      {/* Bark texture */}
      <div className="absolute bottom-2 left-4 right-4 h-6 opacity-30">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute h-full w-px bg-amber-950/50" style={{ left: `${i * 18}%` }} />
        ))}
      </div>
      {/* Cross section showing rings */}
      <div className="absolute bottom-0 -left-1 w-8 h-10 bg-gradient-to-r from-amber-700/50 to-amber-800/40 rounded-l-full overflow-hidden">
        <div className="absolute inset-2 border-2 border-amber-600/30 rounded-full" />
        <div className="absolute inset-3 border border-amber-600/20 rounded-full" />
      </div>
      {/* Moss on top */}
      <div className="absolute top-0 left-8 w-12 h-3 bg-emerald-700/40 rounded-full" />
      <div className="absolute top-1 right-10 w-8 h-2 bg-emerald-800/35 rounded-full" />
      {/* Small fern nearby */}
      <div className="absolute -bottom-2 right-2 w-6 h-8">
        <div className="absolute bottom-0 left-1/2 w-0.5 h-6 bg-emerald-700/50" />
        <div className="absolute bottom-4 left-0 w-3 h-2 bg-emerald-600/40 rounded-full rotate-[-30deg]" />
        <div className="absolute bottom-5 right-0 w-3 h-2 bg-emerald-600/35 rounded-full rotate-[30deg]" />
      </div>
    </div>
    {/* Label */}
    <div className={cn(
      "absolute -bottom-8 left-1/2 -translate-x-1/2",
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

// Old oak tree - research
const OldOakObject: React.FC<ObjectProps> = ({ isActive, onClick, isHighlighted }) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative cursor-pointer transition-all duration-300",
      isHighlighted && "scale-110"
    )}
  >
    {isHighlighted && (
      <div className="absolute -inset-4 bg-primary/30 rounded-xl blur-xl animate-pulse" />
    )}
    <div className={cn(
      "w-24 h-44 relative",
      "transition-all duration-300",
      "group-hover:scale-105",
      isActive && "scale-105",
      isHighlighted && "ring-2 ring-primary/60 rounded"
    )}>
      {/* Trunk */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-32 bg-gradient-to-t from-amber-950/60 to-amber-900/45 rounded" />
      {/* Bark texture */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-24 opacity-40">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="absolute w-full h-px bg-amber-800/50" style={{ top: `${20 + i * 22}%` }} />
        ))}
      </div>
      {/* Hollow/knothole */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-4 h-5 bg-black/40 rounded-full" />
      {/* Canopy */}
      <div className="absolute top-0 left-0 w-24 h-20 bg-gradient-to-t from-emerald-900/50 to-emerald-800/35 rounded-[60%]" />
      {/* Canopy texture */}
      <div className="absolute top-2 left-4 w-8 h-6 bg-emerald-700/25 rounded-full" />
      <div className="absolute top-4 right-4 w-6 h-5 bg-emerald-800/20 rounded-full" />
      {/* Roots */}
      <div className="absolute bottom-0 left-2 w-4 h-3 bg-amber-900/40 rounded-t" />
      <div className="absolute bottom-0 right-2 w-3 h-2 bg-amber-900/35 rounded-t" />
    </div>
    {/* Label */}
    <div className={cn(
      "absolute -bottom-6 left-1/2 -translate-x-1/2",
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

// Moonlit clearing - settings
const MoonlightObject: React.FC<ObjectProps> = ({ isActive, onClick, isHighlighted }) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative cursor-pointer transition-all duration-300",
      isHighlighted && "scale-110"
    )}
  >
    {isHighlighted && (
      <div className="absolute -inset-4 bg-primary/30 rounded-full blur-xl animate-pulse" />
    )}
    <div className={cn(
      "w-20 h-20 relative",
      "transition-all duration-300",
      "group-hover:scale-105",
      isActive && "scale-105",
      isHighlighted && "ring-2 ring-primary/60 rounded-full"
    )}>
      {/* Moon glow */}
      <div className="absolute inset-0 bg-slate-200/25 rounded-full blur-xl" />
      <div className="absolute inset-2 bg-slate-100/35 rounded-full blur-md" />
      {/* Moon */}
      <div className="absolute inset-4 bg-gradient-to-br from-slate-100/60 to-slate-200/50 rounded-full" />
      {/* Moon craters */}
      <div className="absolute top-6 left-6 w-2 h-2 bg-slate-300/30 rounded-full" />
      <div className="absolute top-8 right-5 w-1.5 h-1.5 bg-slate-300/25 rounded-full" />
      <div className="absolute bottom-6 left-8 w-1 h-1 bg-slate-300/20 rounded-full" />
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

// Forest stream - comfort
const ForestStreamObject: React.FC<ObjectProps> = ({ isActive, onClick, isHighlighted }) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative cursor-pointer transition-all duration-300",
      isHighlighted && "scale-110"
    )}
  >
    {isHighlighted && (
      <div className="absolute -inset-4 bg-primary/30 rounded-xl blur-xl animate-pulse" />
    )}
    <div className={cn(
      "w-40 h-16 relative",
      "transition-all duration-300",
      "group-hover:scale-105",
      isActive && "scale-105",
      isHighlighted && "ring-2 ring-primary/60 rounded-xl"
    )}>
      {/* Stream bed */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/30 via-cyan-800/40 to-cyan-900/30 rounded-full" />
      {/* Water */}
      <div className="absolute inset-1 bg-gradient-to-r from-transparent via-cyan-500/35 to-transparent rounded-full" />
      {/* Water shimmer */}
      <div className="absolute inset-2 bg-cyan-300/20 rounded-full animate-pulse" style={{ animationDuration: '3s' }} />
      {/* Stepping stones */}
      <div className="absolute top-3 left-[20%] w-6 h-4 bg-stone-600/50 rounded-full" />
      <div className="absolute top-4 left-[45%] w-5 h-3 bg-stone-600/45 rounded-full" />
      <div className="absolute top-3 right-[20%] w-6 h-4 bg-stone-600/50 rounded-full" />
      {/* Bank vegetation */}
      <div className="absolute -top-2 left-4 w-4 h-4 bg-emerald-700/40 rounded-full" />
      <div className="absolute -bottom-2 right-6 w-5 h-3 bg-emerald-700/35 rounded-full" />
    </div>
    {/* Label */}
    <div className={cn(
      "absolute -bottom-8 left-1/2 -translate-x-1/2",
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
      "bg-black/60 backdrop-blur-md border border-white/10",
      "transition-all duration-300 whitespace-nowrap",
      (isActive || isHighlighted) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
    )}>
      <Heart className="w-3 h-3 text-primary" />
      <span className="text-xs text-white/90">Comfort</span>
    </div>
  </button>
);

export const WoodsWithObjects: React.FC<WoodsWithObjectsProps> = ({
  activeArea,
  onAreaSelect,
  highlightedObject,
  isVisible = true,
}) => {
  return (
    <div className={cn(
      "absolute inset-0 overflow-hidden",
      "transition-opacity duration-1000",
      isVisible ? "opacity-100" : "opacity-0"
    )}>
      {/* Forest background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Night sky through canopy */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-indigo-950/70 via-slate-900/50 to-transparent">
          {/* Stars visible through gaps */}
          {[...Array(20)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute w-0.5 h-0.5 bg-white/60 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Moon */}
        <div className="absolute top-[8%] right-[15%] w-16 h-16 bg-slate-200/30 rounded-full blur-md" />
        <div className="absolute top-[9%] right-[16%] w-14 h-14 bg-slate-100/45 rounded-full" />

        {/* Tree silhouettes - layered depth */}
        {/* Far trees */}
        <div className="absolute left-[2%] top-0 w-20 h-[75%] bg-gradient-to-t from-emerald-950/55 to-emerald-900/35" style={{ clipPath: 'polygon(50% 0%, 95% 100%, 5% 100%)' }} />
        <div className="absolute left-[18%] top-[5%] w-24 h-[70%] bg-gradient-to-t from-emerald-950/50 to-emerald-900/30" style={{ clipPath: 'polygon(50% 0%, 95% 100%, 5% 100%)' }} />
        <div className="absolute right-[5%] top-0 w-22 h-[78%] bg-gradient-to-t from-emerald-950/55 to-emerald-900/35" style={{ clipPath: 'polygon(50% 0%, 95% 100%, 5% 100%)' }} />
        <div className="absolute right-[22%] top-[8%] w-18 h-[65%] bg-gradient-to-t from-emerald-950/45 to-emerald-900/25" style={{ clipPath: 'polygon(50% 0%, 95% 100%, 5% 100%)' }} />
        
        {/* Closer trees with visible trunks */}
        <div className="absolute left-[8%] bottom-0 w-6 h-[40%] bg-gradient-to-t from-amber-950/55 to-amber-900/40 rounded-t" />
        <div className="absolute left-[28%] bottom-0 w-7 h-[45%] bg-gradient-to-t from-amber-950/50 to-amber-900/35 rounded-t" />
        <div className="absolute right-[12%] bottom-0 w-5 h-[38%] bg-gradient-to-t from-amber-950/55 to-amber-900/40 rounded-t" />
        <div className="absolute right-[30%] bottom-0 w-6 h-[42%] bg-gradient-to-t from-amber-950/50 to-amber-900/35 rounded-t" />

        {/* Forest floor */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-emerald-950/65 via-emerald-900/40 to-transparent" />

        {/* Undergrowth - ferns and bushes */}
        <div className="absolute bottom-[8%] left-[15%] w-12 h-8 bg-emerald-800/40 rounded-t-full" />
        <div className="absolute bottom-[6%] left-[35%] w-10 h-6 bg-emerald-800/35 rounded-t-full" />
        <div className="absolute bottom-[7%] right-[25%] w-14 h-9 bg-emerald-800/40 rounded-t-full" />
        <div className="absolute bottom-[5%] right-[45%] w-8 h-5 bg-emerald-900/35 rounded-t-full" />

        {/* Fog/mist layer */}
        <div className="absolute bottom-[15%] left-0 right-0 h-24 bg-gradient-to-t from-white/8 via-white/10 to-transparent blur-sm" />

        {/* Fireflies */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`firefly-${i}`}
            className="absolute w-1.5 h-1.5 bg-yellow-300/60 rounded-full blur-[1px] animate-pulse"
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${35 + Math.random() * 45}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${1.5 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Moonbeams through trees */}
        <div className="absolute top-[10%] right-[20%] w-40 h-80 bg-gradient-to-b from-slate-200/8 via-slate-100/5 to-transparent transform rotate-[15deg] blur-xl" />
      </div>

      {/* Interactive objects */}
      <div className="absolute inset-0">
        {/* Mossy boulder - grounding */}
        <div className="absolute bottom-[16%] left-[14%]">
          <MossyBoulderObject
            id="grounding"
            isActive={activeArea === 'grounding'}
            onClick={() => onAreaSelect('grounding')}
            isHighlighted={highlightedObject === 'grounding'}
          />
        </div>

        {/* Trail marker - goals */}
        <div className="absolute bottom-[22%] left-[35%]">
          <TrailMarkerObject
            id="goals"
            isActive={activeArea === 'goals'}
            onClick={() => onAreaSelect('goals')}
            isHighlighted={highlightedObject === 'goals'}
          />
        </div>

        {/* Fallen log - tools */}
        <div className="absolute bottom-[18%] left-[50%]">
          <FallenLogObject
            id="tools"
            isActive={activeArea === 'tools'}
            onClick={() => onAreaSelect('tools')}
            isHighlighted={highlightedObject === 'tools'}
          />
        </div>

        {/* Old oak - research */}
        <div className="absolute bottom-[14%] right-[8%]">
          <OldOakObject
            id="research"
            isActive={activeArea === 'research'}
            onClick={() => onAreaSelect('research')}
            isHighlighted={highlightedObject === 'research'}
          />
        </div>

        {/* Moonlight - settings */}
        <div className="absolute top-[15%] right-[18%]">
          <MoonlightObject
            id="settings"
            isActive={activeArea === 'settings'}
            onClick={() => onAreaSelect('settings')}
            isHighlighted={highlightedObject === 'settings'}
          />
        </div>

        {/* Forest stream - comfort */}
        <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2">
          <ForestStreamObject
            id="comfort"
            isActive={activeArea === 'comfort'}
            onClick={() => onAreaSelect('comfort')}
            isHighlighted={highlightedObject === 'comfort'}
          />
        </div>
      </div>
    </div>
  );
};
