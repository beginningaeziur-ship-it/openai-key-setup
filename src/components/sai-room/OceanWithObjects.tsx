import React from 'react';
import { cn } from '@/lib/utils';
import { Wind, Target, Coffee, Search, Settings, Heart } from 'lucide-react';

interface OceanWithObjectsProps {
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

// Beach Towel - grounding
const BeachTowelObject: React.FC<ObjectProps> = ({ isActive, onClick, isHighlighted }) => (
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
      "w-36 h-20 relative",
      "transition-all duration-300",
      "group-hover:scale-105",
      isActive && "scale-105",
      isHighlighted && "ring-2 ring-primary/60"
    )}>
      {/* Towel base */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/50 via-cyan-500/40 to-cyan-600/45 rounded-lg" />
      {/* Stripes */}
      <div className="absolute top-[20%] left-0 right-0 h-3 bg-white/25" />
      <div className="absolute top-[50%] left-0 right-0 h-3 bg-white/25" />
      <div className="absolute top-[80%] left-0 right-0 h-3 bg-white/25" />
      {/* Towel folds */}
      <div className="absolute bottom-0 left-[20%] w-[30%] h-4 bg-cyan-700/30 rounded-b" />
      {/* Fringe */}
      <div className="absolute -bottom-2 left-2 right-2 h-2 flex gap-1">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="flex-1 h-full bg-cyan-500/40 rounded-b" />
        ))}
      </div>
    </div>
    {/* Label */}
    <div className={cn(
      "absolute -bottom-10 left-1/2 -translate-x-1/2",
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

// Driftwood with shells - goals
const DriftwoodObject: React.FC<ObjectProps> = ({ isActive, onClick, isHighlighted }) => (
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
      "w-28 h-14 relative",
      "transition-all duration-300",
      "group-hover:scale-110 group-hover:-translate-y-1",
      isActive && "scale-110 -translate-y-1",
      isHighlighted && "ring-2 ring-primary/60"
    )}>
      {/* Main log */}
      <div className="absolute bottom-0 left-0 w-full h-5 bg-gradient-to-r from-amber-700/60 via-amber-600/50 to-amber-700/55 rounded-full transform rotate-[-5deg]" />
      {/* Branch */}
      <div className="absolute bottom-2 left-4 w-10 h-3 bg-amber-700/45 rounded-full transform rotate-[20deg]" />
      {/* Shells on log */}
      <div className="absolute bottom-4 left-8 w-4 h-3 bg-amber-100/50 rounded-full" />
      <div className="absolute bottom-5 left-14 w-3 h-2 bg-pink-200/40 rounded-full" />
      <div className="absolute bottom-4 right-4 w-4 h-3 bg-amber-50/45 rounded-b-full rounded-t-sm" />
      {/* Weathered texture */}
      <div className="absolute bottom-1 left-[30%] w-[40%] h-px bg-amber-800/30" />
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

// Beach bag with items - tools
const BeachBagObject: React.FC<ObjectProps> = ({ isActive, onClick, isHighlighted }) => (
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
      "w-20 h-24 relative",
      "transition-all duration-300",
      "group-hover:scale-105",
      isActive && "scale-105",
      isHighlighted && "ring-2 ring-primary/60 rounded-lg"
    )}>
      {/* Bag body */}
      <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-amber-700/55 to-amber-600/40 rounded-b-lg rounded-t" />
      {/* Bag texture - woven pattern */}
      <div className="absolute bottom-2 left-2 right-2 h-12 opacity-30">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-2 border-b border-amber-800/40" />
        ))}
      </div>
      {/* Handles */}
      <div className="absolute top-0 left-3 w-3 h-8 border-2 border-amber-700/50 rounded-t-full" />
      <div className="absolute top-0 right-3 w-3 h-8 border-2 border-amber-700/50 rounded-t-full" />
      {/* Items peeking out */}
      <div className="absolute top-4 left-5 w-3 h-8 bg-white/40 rounded-t-full" /> {/* Sunscreen */}
      <div className="absolute top-6 right-4 w-4 h-4 bg-rose-400/40 rounded-full" /> {/* Ball */}
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

// Tide pool - research
const TidePoolObject: React.FC<ObjectProps> = ({ isActive, onClick, isHighlighted }) => (
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
      "w-24 h-20 relative",
      "transition-all duration-300",
      "group-hover:scale-105",
      isActive && "scale-105",
      isHighlighted && "ring-2 ring-primary/60 rounded-full"
    )}>
      {/* Rock formation */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-700/60 to-stone-600/40 rounded-[60%]" />
      {/* Water pool */}
      <div className="absolute inset-3 bg-gradient-to-b from-cyan-500/40 to-cyan-700/50 rounded-[50%]">
        {/* Water shimmer */}
        <div className="absolute inset-1 bg-white/10 rounded-full animate-pulse" style={{ animationDuration: '3s' }} />
      </div>
      {/* Sea creatures/shells */}
      <div className="absolute top-4 left-5 w-2 h-2 bg-orange-400/50 rounded-full" /> {/* Starfish */}
      <div className="absolute bottom-5 right-5 w-3 h-2 bg-pink-300/40 rounded" /> {/* Shell */}
      {/* Seaweed */}
      <div className="absolute bottom-3 left-6 w-1 h-4 bg-emerald-600/40 rounded-full" />
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

// Beach umbrella - settings
const BeachUmbrellaObject: React.FC<ObjectProps> = ({ isActive, onClick, isHighlighted }) => (
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
      "w-28 h-36 relative",
      "transition-all duration-300",
      "group-hover:scale-105",
      isActive && "scale-105",
      isHighlighted && "ring-2 ring-primary/60 rounded-full"
    )}>
      {/* Umbrella top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-14 bg-gradient-to-b from-rose-500/50 to-rose-600/40 rounded-t-full" />
      {/* Stripes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-14 rounded-t-full overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-white/20" />
          <div className="flex-1" />
          <div className="flex-1 bg-white/20" />
          <div className="flex-1" />
          <div className="flex-1 bg-white/20" />
        </div>
      </div>
      {/* Fringe */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-26 h-3 flex justify-around">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-1 h-3 bg-rose-500/40 rounded-b" />
        ))}
      </div>
      {/* Pole */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-24 bg-gradient-to-b from-amber-100/50 to-amber-200/40" />
      {/* Shadow on sand */}
      <div className="absolute bottom-0 left-0 w-20 h-4 bg-black/10 rounded-full blur-sm transform -skew-x-12" />
    </div>
    {/* Label */}
    <div className={cn(
      "absolute -bottom-6 left-1/2 -translate-x-1/2",
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

// Sunset horizon - comfort
const SunsetObject: React.FC<ObjectProps> = ({ isActive, onClick, isHighlighted }) => (
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
      "w-32 h-24 relative",
      "transition-all duration-300",
      "group-hover:scale-105",
      isActive && "scale-105",
      isHighlighted && "ring-2 ring-primary/60 rounded-xl"
    )}>
      {/* Horizon glow */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-orange-500/30 via-amber-400/20 to-transparent rounded-b-xl" />
      {/* Sun */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-8 bg-gradient-to-t from-orange-400/60 to-yellow-300/40 rounded-t-full" />
      {/* Sun reflection on water */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-gradient-to-b from-orange-400/40 to-transparent rounded-full blur-sm" />
      {/* Water shimmer */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute bottom-4 w-6 h-1 bg-orange-300/30 rounded-full animate-pulse"
          style={{
            left: `${15 + i * 15}%`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
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

export const OceanWithObjects: React.FC<OceanWithObjectsProps> = ({
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
      {/* Ocean background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Sky gradient - sunset colors */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-orange-300/25 via-pink-400/20 to-cyan-400/15" />
        
        {/* Sun */}
        <div className="absolute top-[12%] right-[18%] w-24 h-24 bg-gradient-to-br from-yellow-200/50 to-orange-400/40 rounded-full blur-lg" />
        <div className="absolute top-[14%] right-[20%] w-18 h-18 bg-yellow-100/60 rounded-full blur-md" />

        {/* Clouds */}
        <div className="absolute top-[8%] left-[15%] w-32 h-10 bg-white/20 rounded-full blur-md" />
        <div className="absolute top-[12%] left-[10%] w-24 h-8 bg-white/15 rounded-full blur-md" />
        <div className="absolute top-[6%] right-[40%] w-28 h-8 bg-pink-200/20 rounded-full blur-md" />

        {/* Ocean - multiple wave layers */}
        <div className="absolute top-[42%] left-0 right-0 h-16 bg-gradient-to-b from-cyan-600/35 to-cyan-700/40" />
        <div className="absolute top-[48%] left-0 right-0 h-20 bg-gradient-to-b from-cyan-700/40 to-cyan-800/45" />
        <div className="absolute top-[55%] left-0 right-0 h-24 bg-gradient-to-b from-cyan-800/45 to-cyan-900/50" />
        
        {/* Wave animations */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-3 bg-cyan-300/15 rounded-full"
            style={{
              top: `${44 + i * 5}%`,
              animation: `wave ${4 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}

        {/* Beach/sand */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-amber-200/40 via-amber-100/30 to-transparent" />
        
        {/* Sand texture */}
        <div className="absolute bottom-0 left-0 right-0 h-20 opacity-40">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-amber-300/50 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        {/* Foam line where waves meet sand */}
        <div className="absolute bottom-[28%] left-0 right-0 h-6 bg-gradient-to-b from-white/25 via-white/15 to-transparent animate-pulse" style={{ animationDuration: '4s' }} />

        {/* Palm tree silhouette */}
        <div className="absolute bottom-[15%] left-[3%] w-20 h-48">
          {/* Trunk */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-32 bg-gradient-to-t from-amber-900/50 to-amber-800/35 transform rotate-[5deg] rounded" />
          {/* Fronds */}
          <div className="absolute top-0 left-0 w-16 h-10 bg-emerald-800/40 rounded-full transform rotate-[-30deg]" />
          <div className="absolute top-2 right-0 w-14 h-8 bg-emerald-800/35 rounded-full transform rotate-[25deg]" />
          <div className="absolute top-4 left-2 w-12 h-8 bg-emerald-900/30 rounded-full transform rotate-[-45deg]" />
        </div>

        {/* Seagulls */}
        <div className="absolute top-[20%] left-[35%] text-slate-600/35 text-3xl transform rotate-[-5deg]">~</div>
        <div className="absolute top-[18%] left-[50%] text-slate-600/25 text-xl transform rotate-[5deg]">~</div>
        <div className="absolute top-[25%] left-[42%] text-slate-600/30 text-2xl">~</div>

        {/* Scattered shells on beach */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`shell-${i}`}
            className="absolute w-3 h-2 bg-amber-100/40 rounded-full"
            style={{
              left: `${10 + Math.random() * 80}%`,
              bottom: `${5 + Math.random() * 15}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>

      {/* Interactive objects */}
      <div className="absolute inset-0">
        {/* Beach towel - grounding */}
        <div className="absolute bottom-[18%] left-[18%]">
          <BeachTowelObject
            id="grounding"
            isActive={activeArea === 'grounding'}
            onClick={() => onAreaSelect('grounding')}
            isHighlighted={highlightedObject === 'grounding'}
          />
        </div>

        {/* Driftwood - goals */}
        <div className="absolute bottom-[24%] left-[35%]">
          <DriftwoodObject
            id="goals"
            isActive={activeArea === 'goals'}
            onClick={() => onAreaSelect('goals')}
            isHighlighted={highlightedObject === 'goals'}
          />
        </div>

        {/* Beach bag - tools */}
        <div className="absolute bottom-[16%] left-[52%]">
          <BeachBagObject
            id="tools"
            isActive={activeArea === 'tools'}
            onClick={() => onAreaSelect('tools')}
            isHighlighted={highlightedObject === 'tools'}
          />
        </div>

        {/* Tide pool - research */}
        <div className="absolute bottom-[20%] right-[12%]">
          <TidePoolObject
            id="research"
            isActive={activeArea === 'research'}
            onClick={() => onAreaSelect('research')}
            isHighlighted={highlightedObject === 'research'}
          />
        </div>

        {/* Beach umbrella - settings */}
        <div className="absolute bottom-[10%] right-[25%]">
          <BeachUmbrellaObject
            id="settings"
            isActive={activeArea === 'settings'}
            onClick={() => onAreaSelect('settings')}
            isHighlighted={highlightedObject === 'settings'}
          />
        </div>

        {/* Sunset - comfort */}
        <div className="absolute top-[32%] left-1/2 -translate-x-1/2">
          <SunsetObject
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
