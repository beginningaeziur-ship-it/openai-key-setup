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
        {/* Night sky through window */}
        <div className="absolute top-6 right-8 w-36 h-52">
          {/* Window frame */}
          <div className="absolute inset-0 rounded-lg border-4 border-amber-900/40 bg-gradient-to-b from-indigo-950/60 via-slate-900/50 to-indigo-900/40" />
          {/* Window panes */}
          <div className="absolute top-0 bottom-0 left-1/2 w-1 -translate-x-1/2 bg-amber-900/40" />
          <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-amber-900/40" />
          {/* Stars */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute w-0.5 h-0.5 bg-white/60 rounded-full animate-pulse"
              style={{
                left: `${15 + Math.random() * 70}%`,
                top: `${10 + Math.random() * 40}%`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
          {/* Moon glow */}
          <div className="absolute top-4 right-4 w-6 h-6 bg-amber-100/30 rounded-full blur-md" />
          <div className="absolute top-5 right-5 w-4 h-4 bg-amber-50/50 rounded-full" />
        </div>
        
        {/* Moonlight beam from window */}
        <div className="absolute top-10 right-10 w-80 h-96 bg-gradient-to-bl from-blue-200/8 via-transparent to-transparent blur-xl transform rotate-12" />
        
        {/* Floor with wooden planks */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#1a1520]/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-28 overflow-hidden">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 h-full"
              style={{ left: `${i * 6.25}%`, width: '6.25%' }}
            >
              <div className="h-full bg-gradient-to-r from-amber-950/30 via-amber-900/15 to-amber-950/20 border-r border-amber-900/10" />
              {/* Wood grain */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-[20%] left-[30%] w-[40%] h-px bg-amber-800/30" />
                <div className="absolute top-[50%] left-[20%] w-[60%] h-px bg-amber-800/20" />
                <div className="absolute top-[75%] left-[25%] w-[50%] h-px bg-amber-800/25" />
              </div>
            </div>
          ))}
        </div>

        {/* Bed - left side with detailed bedding */}
        <div className="absolute bottom-12 left-[4%] w-[32%] h-32">
          {/* Bed frame */}
          <div className="absolute bottom-0 w-full h-6 bg-gradient-to-t from-amber-950/60 to-amber-900/40 rounded-sm" />
          {/* Mattress */}
          <div className="absolute bottom-5 w-full h-8 bg-gradient-to-t from-slate-700/30 to-slate-600/15 rounded-t" />
          {/* Blanket with folds */}
          <div className="absolute bottom-9 w-[97%] left-[1.5%] h-16 bg-gradient-to-t from-indigo-900/35 via-indigo-800/25 to-indigo-700/15 rounded-t-xl" />
          <div className="absolute bottom-14 w-[94%] left-[3%] h-8 bg-indigo-800/10 rounded-t" />
          {/* Wrinkles in blanket */}
          <div className="absolute bottom-16 left-[20%] w-[25%] h-6 bg-indigo-950/15 rounded-full blur-sm" />
          <div className="absolute bottom-14 left-[55%] w-[20%] h-4 bg-indigo-950/10 rounded-full blur-sm" />
          {/* Pillows */}
          <div className="absolute bottom-20 left-[8%] w-[22%] h-8 bg-gradient-to-t from-slate-400/25 to-slate-300/15 rounded-lg shadow-inner" />
          <div className="absolute bottom-21 left-[35%] w-[22%] h-9 bg-gradient-to-t from-slate-400/20 to-slate-300/12 rounded-lg shadow-inner" />
          {/* Headboard */}
          <div className="absolute bottom-24 w-full h-24 bg-gradient-to-t from-amber-950/50 to-amber-900/30 rounded-t-2xl" />
          {/* Headboard detail */}
          <div className="absolute bottom-28 left-[10%] right-[10%] h-16 border-t-2 border-l-2 border-r-2 border-amber-800/20 rounded-t-xl" />
        </div>

        {/* Nightstand */}
        <div className="absolute bottom-10 left-[38%] w-12 h-16">
          <div className="absolute inset-0 bg-gradient-to-t from-amber-950/50 to-amber-900/30 rounded-sm" />
          <div className="absolute top-1 left-1 right-1 h-2 bg-amber-800/30 rounded-t-sm" />
          {/* Drawer handle */}
          <div className="absolute top-[40%] left-[30%] right-[30%] h-1 bg-amber-700/40 rounded" />
          {/* Small lamp on nightstand */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2">
            <div className="w-4 h-3 bg-amber-100/20 rounded-t-full" />
            <div className="w-2 h-4 bg-amber-900/30 mx-auto" />
            <div className="w-4 h-1 bg-amber-900/40 rounded-full" />
            {/* Lamp glow */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-200/10 rounded-full blur-lg" />
          </div>
        </div>

        {/* Armchair - soft silhouette */}
        <div className="absolute bottom-10 right-[35%] w-20 h-24">
          {/* Chair base */}
          <div className="absolute bottom-0 w-full h-4 bg-gradient-to-t from-slate-800/40 to-slate-700/20 rounded-b" />
          {/* Seat */}
          <div className="absolute bottom-3 w-full h-8 bg-gradient-to-t from-slate-700/35 to-slate-600/20 rounded-t" />
          {/* Backrest */}
          <div className="absolute bottom-8 left-[10%] w-[80%] h-14 bg-gradient-to-t from-slate-700/40 to-slate-600/25 rounded-t-2xl" />
          {/* Armrests */}
          <div className="absolute bottom-5 left-0 w-4 h-10 bg-slate-700/30 rounded-t-lg rounded-b-sm" />
          <div className="absolute bottom-5 right-0 w-4 h-10 bg-slate-700/30 rounded-t-lg rounded-b-sm" />
          {/* Cushion detail */}
          <div className="absolute bottom-10 left-[15%] w-[70%] h-4 bg-slate-600/15 rounded" />
          {/* Throw blanket on armchair */}
          <div className="absolute bottom-6 -right-2 w-8 h-12 bg-gradient-to-b from-rose-900/25 to-rose-950/15 rounded-b-lg transform rotate-12" />
        </div>

        {/* Curtains - flowing fabric */}
        <div className="absolute top-2 right-4 w-5 h-60 bg-gradient-to-b from-indigo-900/35 via-indigo-950/40 to-indigo-900/25 rounded-b-lg" />
        <div className="absolute top-2 right-[11.5rem] w-5 h-60 bg-gradient-to-b from-indigo-900/35 via-indigo-950/40 to-indigo-900/25 rounded-b-lg" />
        {/* Curtain rod */}
        <div className="absolute top-1 right-2 w-48 h-1.5 bg-amber-800/40 rounded-full" />
        {/* Curtain tie-backs */}
        <div className="absolute top-32 right-4 w-3 h-6 bg-amber-700/30 rounded-full" />
        <div className="absolute top-32 right-[11.5rem] w-3 h-6 bg-amber-700/30 rounded-full" />

        {/* Wall art with frames */}
        <div className="absolute top-20 left-[14%] w-20 h-14 border-4 border-amber-800/35 bg-slate-800/25 rounded">
          {/* Abstract art inside */}
          <div className="absolute inset-2 overflow-hidden">
            <div className="absolute top-1 left-1 w-6 h-4 bg-primary/15 rounded-full" />
            <div className="absolute bottom-1 right-1 w-8 h-3 bg-rose-800/20 rounded" />
          </div>
        </div>
        <div className="absolute top-16 left-[32%] w-12 h-16 border-3 border-amber-800/30 bg-slate-800/20 rounded">
          <div className="absolute inset-1.5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-transparent" />
          </div>
        </div>

        {/* Potted plant - detailed */}
        <div className="absolute bottom-10 right-[3%]">
          {/* Pot */}
          <div className="w-10 h-8 bg-gradient-to-t from-orange-950/60 to-orange-900/40 rounded-b-xl rounded-t-sm mx-auto" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-2 bg-orange-900/50 rounded-t" />
          {/* Soil */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-9 h-1.5 bg-amber-950/60 rounded-full" />
          {/* Plant leaves */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-16 h-14">
            {/* Main stem */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-10 bg-emerald-900/50" />
            {/* Leaves */}
            <div className="absolute top-0 left-1 w-7 h-5 bg-gradient-to-r from-emerald-800/40 to-emerald-700/25 rounded-full rotate-[-35deg]" />
            <div className="absolute top-1 right-1 w-6 h-4 bg-gradient-to-l from-emerald-800/35 to-emerald-700/20 rounded-full rotate-[35deg]" />
            <div className="absolute top-4 left-0 w-5 h-4 bg-gradient-to-r from-emerald-900/30 to-emerald-800/15 rounded-full rotate-[-50deg]" />
            <div className="absolute top-5 right-0 w-5 h-3.5 bg-gradient-to-l from-emerald-900/30 to-emerald-800/15 rounded-full rotate-[45deg]" />
            <div className="absolute top-8 left-2 w-4 h-3 bg-emerald-900/25 rounded-full rotate-[-25deg]" />
          </div>
        </div>

        {/* Wall sconces */}
        <div className="absolute top-28 left-[48%] w-6 h-8">
          <div className="w-full h-full bg-gradient-to-b from-amber-100/15 to-transparent rounded-t-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-3 bg-amber-900/40" />
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-200/8 rounded-full blur-xl" />
        </div>

        {/* Floating dust particles in moonlight */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`dust-${i}`}
            className="absolute w-0.5 h-0.5 bg-white/15 rounded-full animate-float"
            style={{
              left: `${5 + Math.random() * 90}%`,
              top: `${10 + Math.random() * 70}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}

        {/* Subtle ambient lighting */}
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-amber-500/3 rounded-full blur-3xl" />
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