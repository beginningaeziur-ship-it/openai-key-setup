import React from 'react';
import { cn } from '@/lib/utils';
import { 
  RugObject, 
  NotebookObject, 
  CoffeeTableObject, 
  BookshelfObject, 
  LampObject, 
  FireplaceObject 
} from './LifelikeObjects';

interface CabinWithObjectsProps {
  activeArea: string | null;
  onAreaSelect: (id: string) => void;
  highlightedObject?: string;
  isVisible?: boolean;
}

export const CabinWithObjects: React.FC<CabinWithObjectsProps> = ({
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
      {/* Cabin background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Window with snowy mountains */}
        <div className="absolute top-8 left-12 w-44 h-56 rounded-lg overflow-hidden">
          {/* Window frame - thick wooden */}
          <div className="absolute inset-0 border-8 border-amber-800/60 rounded-lg z-10" />
          {/* Window cross panes */}
          <div className="absolute top-0 bottom-0 left-1/2 w-2 -translate-x-1/2 bg-amber-800/60 z-10" />
          <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 bg-amber-800/60 z-10" />
          {/* View through window - snowy mountains */}
          <div className="absolute inset-2 bg-gradient-to-b from-slate-400/40 via-slate-500/30 to-white/30">
            {/* Mountains */}
            <div className="absolute bottom-0 left-0 right-0 h-24">
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-t from-white/40 to-slate-400/30" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
              <div className="absolute bottom-0 left-12 w-24 h-24 bg-gradient-to-t from-white/50 to-slate-500/40" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
              <div className="absolute bottom-0 right-0 w-18 h-16 bg-gradient-to-t from-white/35 to-slate-400/25" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
            </div>
            {/* Snow falling */}
            {[...Array(15)].map((_, i) => (
              <div
                key={`snow-${i}`}
                className="absolute w-1 h-1 bg-white/60 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 80}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
          {/* Frost on window edges */}
          <div className="absolute inset-2 border-4 border-white/20 rounded blur-sm" />
          {/* Snow on window sill */}
          <div className="absolute -bottom-1 left-0 right-0 h-4 bg-gradient-to-t from-white/50 to-white/20 rounded-t z-20" />
        </div>

        {/* Log walls - horizontal logs */}
        <div className="absolute top-0 left-0 right-0 h-2/3 overflow-hidden opacity-40">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i} 
              className="h-8 w-full border-b border-amber-900/30"
              style={{
                background: `linear-gradient(180deg, 
                  rgba(120, 53, 15, ${0.15 + (i % 2) * 0.05}) 0%, 
                  rgba(92, 45, 12, ${0.12 + (i % 2) * 0.05}) 50%, 
                  rgba(120, 53, 15, ${0.15 + (i % 2) * 0.05}) 100%)`
              }}
            />
          ))}
        </div>

        {/* Wooden beams - vertical supports */}
        <div className="absolute top-0 left-[15%] w-8 h-full bg-gradient-to-r from-amber-950/50 via-amber-900/40 to-amber-950/50 shadow-xl" />
        <div className="absolute top-0 right-[20%] w-8 h-full bg-gradient-to-r from-amber-950/50 via-amber-900/40 to-amber-950/50 shadow-xl" />

        {/* Stone floor */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-stone-900/70 via-stone-800/50 to-transparent">
          {/* Stone pattern */}
          <div className="absolute bottom-0 left-0 right-0 h-24 opacity-30">
            <div className="absolute bottom-2 left-[5%] w-16 h-10 bg-stone-700/40 rounded" />
            <div className="absolute bottom-4 left-[25%] w-14 h-8 bg-stone-600/35 rounded" />
            <div className="absolute bottom-2 left-[45%] w-18 h-12 bg-stone-700/30 rounded" />
            <div className="absolute bottom-3 left-[65%] w-12 h-9 bg-stone-600/40 rounded" />
            <div className="absolute bottom-2 left-[80%] w-16 h-10 bg-stone-700/35 rounded" />
          </div>
        </div>

        {/* Leather armchair */}
        <div className="absolute bottom-16 right-[12%] w-28 h-32">
          {/* Chair base */}
          <div className="absolute bottom-0 w-full h-6 bg-gradient-to-t from-amber-950/60 to-amber-900/40 rounded-b" />
          {/* Seat cushion */}
          <div className="absolute bottom-4 w-full h-10 bg-gradient-to-t from-amber-900/50 to-amber-800/35 rounded-t-lg" />
          {/* Backrest */}
          <div className="absolute bottom-10 left-[8%] w-[84%] h-20 bg-gradient-to-t from-amber-900/55 to-amber-800/40 rounded-t-2xl" />
          {/* Armrests */}
          <div className="absolute bottom-6 left-0 w-5 h-14 bg-amber-900/45 rounded-t-lg" />
          <div className="absolute bottom-6 right-0 w-5 h-14 bg-amber-900/45 rounded-t-lg" />
          {/* Button tufts */}
          <div className="absolute bottom-16 left-[25%] w-2 h-2 bg-amber-950/40 rounded-full" />
          <div className="absolute bottom-16 right-[25%] w-2 h-2 bg-amber-950/40 rounded-full" />
          <div className="absolute bottom-22 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-950/40 rounded-full" />
          {/* Blanket draped over arm */}
          <div className="absolute bottom-8 -right-4 w-12 h-18 bg-gradient-to-b from-rose-900/35 to-rose-950/25 rounded-b-xl transform rotate-12" />
        </div>

        {/* Antler decoration on wall */}
        <div className="absolute top-20 right-[28%] w-24 h-16 opacity-50">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-amber-800/50 rounded-full" />
          <div className="absolute bottom-3 left-[20%] w-3 h-12 bg-amber-100/35 rounded-full rotate-[-25deg]" />
          <div className="absolute bottom-3 right-[20%] w-3 h-12 bg-amber-100/35 rounded-full rotate-[25deg]" />
          <div className="absolute bottom-6 left-[10%] w-2 h-6 bg-amber-100/25 rounded-full rotate-[-45deg]" />
          <div className="absolute bottom-6 right-[10%] w-2 h-6 bg-amber-100/25 rounded-full rotate-[45deg]" />
        </div>

        {/* Woven basket by chair */}
        <div className="absolute bottom-10 right-[6%] w-12 h-10">
          <div className="w-full h-full bg-gradient-to-t from-amber-800/50 to-amber-700/30 rounded-b-xl rounded-t" />
          <div className="absolute inset-1 border-y-2 border-amber-600/20 rounded" />
        </div>

        {/* Candles on mantle */}
        <div className="absolute bottom-[38%] left-[42%] w-4 h-8">
          <div className="w-full h-6 bg-gradient-to-t from-amber-100/40 to-amber-50/30 rounded-t-sm" />
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-3 bg-gradient-to-t from-orange-400/60 to-yellow-300/40 rounded-full blur-[1px] animate-pulse" />
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-amber-200/15 rounded-full blur-lg" />
        </div>

        {/* Floating embers from fireplace */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`ember-${i}`}
            className="absolute w-1 h-1 bg-orange-400/40 rounded-full animate-float"
            style={{
              left: `${40 + Math.random() * 20}%`,
              bottom: `${8 + Math.random() * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
            }}
          />
        ))}

        {/* Warm ambient glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      {/* Interactive objects */}
      <div className="absolute inset-0">
        {/* Hearth rug */}
        <div className="absolute bottom-[14%] left-[22%]">
          <RugObject
            id="grounding"
            isActive={activeArea === 'grounding'}
            onClick={() => onAreaSelect('grounding')}
            isHighlighted={highlightedObject === 'grounding'}
          />
        </div>

        {/* Journal on side table */}
        <div className="absolute bottom-[30%] left-[32%]">
          <NotebookObject
            id="goals"
            isActive={activeArea === 'goals'}
            onClick={() => onAreaSelect('goals')}
            isHighlighted={highlightedObject === 'goals'}
          />
        </div>

        {/* Wooden table */}
        <div className="absolute bottom-[20%] left-[48%]">
          <CoffeeTableObject
            id="tools"
            isActive={activeArea === 'tools'}
            onClick={() => onAreaSelect('tools')}
            isHighlighted={highlightedObject === 'tools'}
          />
        </div>

        {/* Bookshelf */}
        <div className="absolute bottom-[22%] right-[6%]">
          <BookshelfObject
            id="research"
            isActive={activeArea === 'research'}
            onClick={() => onAreaSelect('research')}
            isHighlighted={highlightedObject === 'research'}
          />
        </div>

        {/* Standing lamp */}
        <div className="absolute bottom-[16%] right-[18%]">
          <LampObject
            id="settings"
            isActive={activeArea === 'settings'}
            onClick={() => onAreaSelect('settings')}
            isHighlighted={highlightedObject === 'settings'}
          />
        </div>

        {/* Fireplace */}
        <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2">
          <FireplaceObject
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
