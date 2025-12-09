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

interface BedroomWithObjectsProps {
  activeArea: string | null;
  onAreaSelect: (id: string) => void;
  highlightedObject?: string;
  isVisible?: boolean;
}

export const BedroomWithObjects: React.FC<BedroomWithObjectsProps> = ({
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
      {/* Room background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Moonlight from window */}
        <div className="absolute top-8 right-12 w-32 h-48 rounded-lg bg-gradient-to-b from-blue-200/10 to-transparent blur-sm" />
        <div className="absolute top-8 right-12 w-32 h-48 border-2 border-white/10 rounded-lg" />
        <div className="absolute top-12 right-16 w-64 h-80 bg-gradient-to-bl from-blue-300/5 via-transparent to-transparent blur-2xl" />
        
        {/* Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#1a1520]/80 to-transparent" />
        
        {/* Wooden floor planks */}
        <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden opacity-30">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 h-full border-r border-amber-900/20"
              style={{ left: `${i * 8.33}%`, width: '8.33%' }}
            >
              <div className="h-full bg-gradient-to-r from-amber-950/40 to-amber-900/20" />
            </div>
          ))}
        </div>

        {/* Bed silhouette - left side */}
        <div className="absolute bottom-16 left-[5%] w-[30%] h-28 opacity-60">
          <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-amber-950/50 to-amber-900/30 rounded-sm" />
          <div className="absolute bottom-6 w-full h-10 bg-gradient-to-t from-slate-700/40 to-slate-600/20 rounded-t-lg" />
          <div className="absolute bottom-10 w-[95%] left-[2.5%] h-14 bg-gradient-to-t from-indigo-900/30 via-indigo-800/20 to-indigo-700/10 rounded-t-xl" />
          <div className="absolute bottom-20 left-[5%] w-[25%] h-8 bg-slate-400/20 rounded-lg" />
          <div className="absolute bottom-20 left-[35%] w-[25%] h-8 bg-slate-400/20 rounded-lg" />
          <div className="absolute bottom-24 w-full h-20 bg-gradient-to-t from-amber-950/40 to-amber-900/20 rounded-t-xl" />
        </div>

        {/* Curtains */}
        <div className="absolute top-4 right-8 w-4 h-56 bg-gradient-to-b from-indigo-900/30 to-indigo-950/40 rounded-b-lg" />
        <div className="absolute top-4 right-[11rem] w-4 h-56 bg-gradient-to-b from-indigo-900/30 to-indigo-950/40 rounded-b-lg" />

        {/* Wall art */}
        <div className="absolute top-24 left-[12%] w-16 h-12 border-2 border-amber-800/30 bg-slate-800/20 rounded-sm" />
        <div className="absolute top-20 left-[28%] w-10 h-14 border-2 border-amber-800/30 bg-slate-800/20 rounded-sm" />

        {/* Potted plant */}
        <div className="absolute bottom-14 right-[3%]">
          <div className="w-8 h-6 bg-gradient-to-t from-orange-950/50 to-orange-900/30 rounded-b-lg rounded-t-sm mx-auto" />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-12 h-12">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-8 bg-emerald-900/40" />
            <div className="absolute top-0 left-0 w-6 h-4 bg-emerald-800/30 rounded-full rotate-[-30deg]" />
            <div className="absolute top-1 right-0 w-5 h-3 bg-emerald-700/30 rounded-full rotate-[30deg]" />
          </div>
        </div>

        {/* Floating dust particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`dust-${i}`}
            className="absolute w-0.5 h-0.5 bg-white/10 rounded-full animate-float"
            style={{
              left: `${5 + Math.random() * 90}%`,
              top: `${10 + Math.random() * 70}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Interactive objects - positioned in the room */}
      <div className="absolute inset-0">
        {/* Rug - center floor */}
        <div className="absolute bottom-[12%] left-[18%]">
          <RugObject
            id="grounding"
            isActive={activeArea === 'grounding'}
            onClick={() => onAreaSelect('grounding')}
            isHighlighted={highlightedObject === 'grounding'}
          />
        </div>

        {/* Notebook - on surface near center */}
        <div className="absolute bottom-[28%] left-[38%]">
          <NotebookObject
            id="goals"
            isActive={activeArea === 'goals'}
            onClick={() => onAreaSelect('goals')}
            isHighlighted={highlightedObject === 'goals'}
          />
        </div>

        {/* Coffee Table - center right */}
        <div className="absolute bottom-[18%] left-[52%]">
          <CoffeeTableObject
            id="tools"
            isActive={activeArea === 'tools'}
            onClick={() => onAreaSelect('tools')}
            isHighlighted={highlightedObject === 'tools'}
          />
        </div>

        {/* Bookshelf - right wall */}
        <div className="absolute bottom-[20%] right-[8%]">
          <BookshelfObject
            id="research"
            isActive={activeArea === 'research'}
            onClick={() => onAreaSelect('research')}
            isHighlighted={highlightedObject === 'research'}
          />
        </div>

        {/* Lamp - right side */}
        <div className="absolute bottom-[18%] right-[22%]">
          <LampObject
            id="settings"
            isActive={activeArea === 'settings'}
            onClick={() => onAreaSelect('settings')}
            isHighlighted={highlightedObject === 'settings'}
          />
        </div>

        {/* Fireplace - center bottom */}
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
