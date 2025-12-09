import React from "react";
import { cn } from "@/lib/utils";
import { 
  Wind, Target, Coffee, Search, Settings, Flame,
  TreePine, Waves, Moon, Sun
} from "lucide-react";

interface SceneEnvironmentProps {
  scene: string;
  activeArea: string | null;
  handleAreaClick: (id: string) => void;
  isVisible?: boolean;
  highlightedObject?: string;
}

interface ObjectConfig {
  id: string;
  label: string;
  position: { left?: string; right?: string; top?: string; bottom?: string };
  icon: React.ReactNode;
}

const sceneObjects: Record<string, ObjectConfig[]> = {
  cabin: [
    { id: 'grounding', label: 'Hearth Rug', position: { left: '22%', bottom: '15%' }, icon: <Wind className="w-3 h-3" /> },
    { id: 'goals', label: 'Journal', position: { left: '35%', bottom: '25%' }, icon: <Target className="w-3 h-3" /> },
    { id: 'tools', label: 'Table', position: { left: '52%', bottom: '18%' }, icon: <Coffee className="w-3 h-3" /> },
    { id: 'research', label: 'Shelf', position: { right: '15%', bottom: '35%' }, icon: <Search className="w-3 h-3" /> },
    { id: 'settings', label: 'Lamp', position: { right: '22%', bottom: '50%' }, icon: <Settings className="w-3 h-3" /> },
    { id: 'comfort', label: 'Fireplace', position: { left: '45%', bottom: '6%' }, icon: <Flame className="w-3 h-3" /> },
  ],
  ocean: [
    { id: 'grounding', label: 'Sandy Shore', position: { left: '18%', bottom: '12%' }, icon: <Waves className="w-3 h-3" /> },
    { id: 'goals', label: 'Driftwood', position: { left: '35%', bottom: '18%' }, icon: <Target className="w-3 h-3" /> },
    { id: 'tools', label: 'Beach Blanket', position: { left: '55%', bottom: '14%' }, icon: <Coffee className="w-3 h-3" /> },
    { id: 'research', label: 'Tide Pool', position: { right: '18%', bottom: '22%' }, icon: <Search className="w-3 h-3" /> },
    { id: 'settings', label: 'Sunset', position: { right: '12%', top: '28%' }, icon: <Sun className="w-3 h-3" /> },
    { id: 'comfort', label: 'Warm Breeze', position: { left: '42%', bottom: '28%' }, icon: <Wind className="w-3 h-3" /> },
  ],
  woods: [
    { id: 'grounding', label: 'Mossy Stone', position: { left: '16%', bottom: '15%' }, icon: <TreePine className="w-3 h-3" /> },
    { id: 'goals', label: 'Trail Marker', position: { left: '36%', bottom: '22%' }, icon: <Target className="w-3 h-3" /> },
    { id: 'tools', label: 'Clearing', position: { left: '54%', bottom: '16%' }, icon: <Coffee className="w-3 h-3" /> },
    { id: 'research', label: 'Old Oak', position: { right: '14%', bottom: '32%' }, icon: <Search className="w-3 h-3" /> },
    { id: 'settings', label: 'Moonlight', position: { right: '16%', top: '22%' }, icon: <Moon className="w-3 h-3" /> },
    { id: 'comfort', label: 'Stream', position: { left: '28%', bottom: '8%' }, icon: <Waves className="w-3 h-3" /> },
  ],
};

// Cabin Scene Environment
const CabinEnvironment: React.FC<{ activeArea: string | null; onAreaSelect: (id: string) => void; highlightedObject?: string; isVisible: boolean }> = ({ 
  activeArea, onAreaSelect, highlightedObject, isVisible 
}) => (
  <div className={cn("absolute inset-0 overflow-hidden transition-opacity duration-1000", isVisible ? "opacity-100" : "opacity-0")}>
    <div className="absolute inset-0 pointer-events-none">
      {/* Window with snowy mountains */}
      <div className="absolute top-8 left-12 w-40 h-48 rounded-lg border-4 border-amber-800/50 bg-gradient-to-b from-slate-600/40 via-slate-700/30 to-white/20 overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/30 to-transparent" />
        <div className="absolute bottom-8 left-4 w-12 h-10 bg-white/25 rounded-t-full" />
        <div className="absolute bottom-6 right-6 w-10 h-12 bg-white/20 rounded-t-full" />
        {/* Snow on window sill */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/30" />
      </div>
      {/* Log walls */}
      <div className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden opacity-30">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-8 w-full bg-gradient-to-b from-amber-900/40 to-amber-950/30 border-b border-amber-800/20" />
        ))}
      </div>
      {/* Stone floor */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-stone-900/60 to-transparent" />
      {/* Wooden beams */}
      <div className="absolute top-0 left-[20%] w-6 h-full bg-gradient-to-b from-amber-900/50 to-amber-950/40" />
      <div className="absolute top-0 right-[25%] w-6 h-full bg-gradient-to-b from-amber-900/50 to-amber-950/40" />
      {/* Wool blanket on chair */}
      <div className="absolute bottom-16 right-[15%] w-16 h-20">
        <div className="absolute bottom-0 w-full h-8 bg-stone-800/40 rounded" />
        <div className="absolute bottom-4 w-full h-12 bg-stone-700/30 rounded-t-lg" />
        <div className="absolute bottom-8 left-1 w-10 h-8 bg-rose-900/30 rounded" />
      </div>
      {/* Antler decoration */}
      <div className="absolute top-16 right-[30%] w-20 h-12 opacity-40">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-amber-800/50 rounded-full" />
        <div className="absolute bottom-2 left-1/4 w-2 h-8 bg-amber-100/30 rounded-full rotate-[-20deg]" />
        <div className="absolute bottom-2 right-1/4 w-2 h-8 bg-amber-100/30 rounded-full rotate-[20deg]" />
      </div>
      {/* Lantern on table */}
      <div className="absolute bottom-28 left-[45%] w-6 h-10">
        <div className="w-full h-full bg-gradient-to-t from-amber-900/50 to-amber-700/30 rounded" />
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-5 bg-amber-200/30 rounded blur-sm animate-pulse" />
      </div>
      {/* Floating dust/embers */}
      {[...Array(12)].map((_, i) => (
        <div
          key={`ember-${i}`}
          className="absolute w-1 h-1 bg-orange-400/30 rounded-full animate-float"
          style={{
            left: `${30 + Math.random() * 40}%`,
            bottom: `${5 + Math.random() * 30}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${4 + Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
    {/* Interactive objects */}
    {sceneObjects.cabin.map((obj) => (
      <InteractiveObject
        key={obj.id}
        {...obj}
        isActive={activeArea === obj.id}
        isHighlighted={highlightedObject === obj.id}
        onClick={() => onAreaSelect(obj.id)}
      />
    ))}
  </div>
);

// Ocean Scene Environment  
const OceanEnvironment: React.FC<{ activeArea: string | null; onAreaSelect: (id: string) => void; highlightedObject?: string; isVisible: boolean }> = ({ 
  activeArea, onAreaSelect, highlightedObject, isVisible 
}) => (
  <div className={cn("absolute inset-0 overflow-hidden transition-opacity duration-1000", isVisible ? "opacity-100" : "opacity-0")}>
    <div className="absolute inset-0 pointer-events-none">
      {/* Sky gradient */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-orange-400/20 via-pink-400/15 to-cyan-500/10" />
      {/* Sun */}
      <div className="absolute top-[15%] right-[15%] w-20 h-20 bg-gradient-to-br from-yellow-300/40 to-orange-400/30 rounded-full blur-lg" />
      <div className="absolute top-[17%] right-[17%] w-14 h-14 bg-yellow-200/50 rounded-full blur-md" />
      {/* Ocean horizon */}
      <div className="absolute top-[45%] left-0 right-0 h-1 bg-cyan-700/40" />
      {/* Ocean waves */}
      <div className="absolute top-[45%] left-0 right-0 h-24 bg-gradient-to-b from-cyan-700/30 via-cyan-800/25 to-cyan-900/20 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-2 bg-cyan-400/10 rounded-full"
            style={{
              top: `${i * 20}%`,
              animation: `wave ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>
      {/* Beach/sand */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-amber-200/30 via-amber-100/20 to-transparent" />
      {/* Foam line */}
      <div className="absolute bottom-[28%] left-0 right-0 h-4 bg-gradient-to-b from-white/20 to-transparent" />
      {/* Driftwood log */}
      <div className="absolute bottom-[16%] left-[32%] w-24 h-4 bg-gradient-to-r from-amber-800/50 via-amber-700/40 to-amber-800/30 rounded-full transform rotate-[-8deg]" />
      <div className="absolute bottom-[17%] left-[30%] w-6 h-3 bg-amber-800/40 rounded-full transform rotate-[45deg]" />
      {/* Beach blanket */}
      <div className="absolute bottom-[11%] left-[52%] w-20 h-16 bg-gradient-to-br from-rose-600/30 to-rose-700/20 rounded" />
      <div className="absolute bottom-[13%] left-[54%] w-16 h-12 border-2 border-white/10 rounded" />
      {/* Shells scattered */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`shell-${i}`}
          className="absolute w-2 h-2 bg-amber-100/30 rounded-full"
          style={{
            left: `${15 + Math.random() * 70}%`,
            bottom: `${8 + Math.random() * 12}%`,
          }}
        />
      ))}
      {/* Seagull silhouettes */}
      <div className="absolute top-[25%] left-[30%] text-slate-600/30 text-2xl">~</div>
      <div className="absolute top-[22%] left-[45%] text-slate-600/20 text-lg">~</div>
      {/* Palm fronds from edge */}
      <div className="absolute top-0 left-0 w-32 h-40 bg-gradient-to-br from-emerald-800/30 to-transparent rounded-br-full" />
    </div>
    {/* Interactive objects */}
    {sceneObjects.ocean.map((obj) => (
      <InteractiveObject
        key={obj.id}
        {...obj}
        isActive={activeArea === obj.id}
        isHighlighted={highlightedObject === obj.id}
        onClick={() => onAreaSelect(obj.id)}
      />
    ))}
  </div>
);

// Woods Scene Environment
const WoodsEnvironment: React.FC<{ activeArea: string | null; onAreaSelect: (id: string) => void; highlightedObject?: string; isVisible: boolean }> = ({ 
  activeArea, onAreaSelect, highlightedObject, isVisible 
}) => (
  <div className={cn("absolute inset-0 overflow-hidden transition-opacity duration-1000", isVisible ? "opacity-100" : "opacity-0")}>
    <div className="absolute inset-0 pointer-events-none">
      {/* Night sky through canopy */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-indigo-950/60 to-transparent">
        {/* Stars visible through gaps */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-0.5 h-0.5 bg-white/50 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
        {/* Moon */}
        <div className="absolute top-[10%] right-[18%] w-12 h-12 bg-slate-200/30 rounded-full blur-sm" />
        <div className="absolute top-[11%] right-[19%] w-10 h-10 bg-slate-100/40 rounded-full" />
      </div>
      {/* Tree silhouettes */}
      <div className="absolute left-[5%] top-0 w-16 h-[70%] bg-gradient-to-t from-emerald-950/60 to-emerald-900/40" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
      <div className="absolute left-[15%] top-[5%] w-20 h-[65%] bg-gradient-to-t from-emerald-950/50 to-emerald-900/30" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
      <div className="absolute right-[8%] top-0 w-18 h-[75%] bg-gradient-to-t from-emerald-950/55 to-emerald-900/35" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
      <div className="absolute right-[20%] top-[8%] w-14 h-[60%] bg-gradient-to-t from-emerald-950/45 to-emerald-900/25" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
      {/* Tree trunks */}
      <div className="absolute left-[11%] bottom-0 w-4 h-[35%] bg-amber-950/50" />
      <div className="absolute left-[23%] bottom-0 w-5 h-[40%] bg-amber-950/45" />
      <div className="absolute right-[15%] bottom-0 w-4 h-[38%] bg-amber-950/50" />
      <div className="absolute right-[26%] bottom-0 w-3 h-[32%] bg-amber-950/40" />
      {/* Forest floor */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-emerald-950/60 via-emerald-900/30 to-transparent" />
      {/* Mossy stones */}
      <div className="absolute bottom-[12%] left-[14%] w-16 h-10 bg-gradient-to-t from-stone-700/50 to-stone-600/30 rounded-full" />
      <div className="absolute bottom-[13%] left-[16%] w-12 h-6 bg-emerald-800/30 rounded-t-full" />
      {/* Fallen log */}
      <div className="absolute bottom-[8%] left-[40%] w-32 h-5 bg-gradient-to-r from-amber-900/50 via-amber-800/40 to-amber-900/30 rounded-full transform rotate-[-5deg]" />
      {/* Ferns and undergrowth */}
      <div className="absolute bottom-[5%] left-[25%] w-8 h-6 bg-emerald-800/40 rounded-t-full" />
      <div className="absolute bottom-[4%] right-[30%] w-10 h-7 bg-emerald-800/35 rounded-t-full" />
      {/* Stream */}
      <div className="absolute bottom-[5%] left-[26%] w-24 h-4 bg-gradient-to-r from-transparent via-cyan-600/30 to-transparent rounded-full" />
      <div className="absolute bottom-[4%] left-[30%] w-16 h-3 bg-cyan-400/20 rounded-full animate-pulse" style={{ animationDuration: '3s' }} />
      {/* Fireflies */}
      {[...Array(10)].map((_, i) => (
        <div
          key={`firefly-${i}`}
          className="absolute w-1 h-1 bg-yellow-300/50 rounded-full animate-pulse"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${40 + Math.random() * 40}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
      {/* Fog/mist */}
      <div className="absolute bottom-[15%] left-0 right-0 h-20 bg-gradient-to-t from-white/5 via-white/8 to-transparent blur-sm" />
    </div>
    {/* Interactive objects */}
    {sceneObjects.woods.map((obj) => (
      <InteractiveObject
        key={obj.id}
        {...obj}
        isActive={activeArea === obj.id}
        isHighlighted={highlightedObject === obj.id}
        onClick={() => onAreaSelect(obj.id)}
      />
    ))}
  </div>
);

// Interactive Object Component
const InteractiveObject: React.FC<ObjectConfig & { isActive: boolean; isHighlighted: boolean; onClick: () => void }> = ({
  id, label, position, icon, isActive, isHighlighted, onClick
}) => (
  <button
    onClick={onClick}
    style={{
      position: 'absolute',
      ...position,
    }}
    className={cn(
      "group cursor-pointer transition-all duration-300 pointer-events-auto",
      isHighlighted && "scale-125 z-20"
    )}
  >
    {/* Highlight glow */}
    {isHighlighted && (
      <div className="absolute -inset-6 bg-primary/40 rounded-full blur-xl animate-pulse" />
    )}
    {/* Object marker */}
    <div className={cn(
      "w-12 h-12 rounded-xl flex items-center justify-center",
      "bg-black/40 backdrop-blur-sm border border-white/20",
      "transition-all duration-300",
      "group-hover:bg-black/60 group-hover:scale-110 group-hover:border-primary/50",
      isActive && "bg-primary/30 border-primary/50 scale-110",
      isHighlighted && "bg-primary/40 border-primary ring-4 ring-primary/50 shadow-2xl shadow-primary/50"
    )}>
      <span className={cn(
        "text-foreground/70 transition-colors",
        (isActive || isHighlighted) && "text-primary"
      )}>
        {icon}
      </span>
    </div>
    {/* Label */}
    <div className={cn(
      "absolute -bottom-8 left-1/2 -translate-x-1/2",
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
      "bg-black/60 backdrop-blur-md border border-white/10",
      "transition-all duration-300 whitespace-nowrap",
      (isActive || isHighlighted) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
    )}>
      {icon}
      <span className="text-xs text-white/90">{label}</span>
    </div>
  </button>
);

export function SceneEnvironment({ scene, activeArea, handleAreaClick, isVisible = true, highlightedObject }: SceneEnvironmentProps) {
  switch (scene) {
    case 'cabin':
      return <CabinEnvironment activeArea={activeArea} onAreaSelect={handleAreaClick} highlightedObject={highlightedObject} isVisible={isVisible} />;
    case 'ocean':
      return <OceanEnvironment activeArea={activeArea} onAreaSelect={handleAreaClick} highlightedObject={highlightedObject} isVisible={isVisible} />;
    case 'woods':
      return <WoodsEnvironment activeArea={activeArea} onAreaSelect={handleAreaClick} highlightedObject={highlightedObject} isVisible={isVisible} />;
    default:
      return null;
  }
}