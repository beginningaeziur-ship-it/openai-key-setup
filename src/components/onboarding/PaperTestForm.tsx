import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface PaperTestFormProps {
  children: ReactNode;
  className?: string;
}

export function PaperTestForm({ children, className }: PaperTestFormProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900/20 via-stone-800 to-stone-900 flex items-center justify-center p-4">
      {/* Desk surface */}
      <div className="relative w-full max-w-2xl">
        {/* Desk wood grain texture overlay */}
        <div 
          className="absolute inset-0 -m-8 rounded-xl opacity-30"
          style={{
            background: `
              linear-gradient(90deg, 
                transparent 0%, 
                rgba(139, 90, 43, 0.1) 25%, 
                transparent 50%, 
                rgba(139, 90, 43, 0.1) 75%, 
                transparent 100%
              )
            `,
            backgroundSize: '20px 100%',
          }}
        />
        
        {/* Paper shadow */}
        <div 
          className="absolute inset-0 translate-x-2 translate-y-2 bg-black/30 rounded-sm blur-md"
          style={{ transform: 'translate(8px, 8px) rotate(0.5deg)' }}
        />
        
        {/* Paper */}
        <div 
          className={cn(
            "relative bg-amber-50 rounded-sm p-8 md:p-10",
            "shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
            "border border-amber-200/50",
            className
          )}
          style={{
            transform: 'rotate(-0.5deg)',
            backgroundImage: `
              linear-gradient(transparent 0px, transparent 28px, #e5d5c0 28px, #e5d5c0 29px),
              linear-gradient(90deg, #f5efe6 0px, #faf8f4 100%)
            `,
            backgroundSize: '100% 30px, 100% 100%',
          }}
        >
          {/* Red margin line */}
          <div 
            className="absolute left-12 top-0 bottom-0 w-[2px] bg-red-300/50"
          />
          
          {/* Hole punches */}
          <div className="absolute left-4 top-1/4 w-3 h-3 rounded-full bg-stone-800/80 shadow-inner" />
          <div className="absolute left-4 top-1/2 w-3 h-3 rounded-full bg-stone-800/80 shadow-inner" />
          <div className="absolute left-4 top-3/4 w-3 h-3 rounded-full bg-stone-800/80 shadow-inner" />
          
          {/* Content area */}
          <div className="ml-8 space-y-6">
            {children}
          </div>
        </div>
        
        {/* Pencil decoration */}
        <div 
          className="absolute -right-4 -bottom-8 w-32 h-3 rounded-full"
          style={{
            background: 'linear-gradient(180deg, #f4c542 0%, #e6a832 50%, #d4941a 100%)',
            transform: 'rotate(-15deg)',
            boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          {/* Pencil tip */}
          <div 
            className="absolute -left-3 top-0 w-4 h-3"
            style={{
              background: 'linear-gradient(90deg, #2a2a2a 0%, #4a4a4a 30%, #d4941a 100%)',
              clipPath: 'polygon(100% 0, 100% 100%, 0 50%)',
            }}
          />
          {/* Eraser */}
          <div 
            className="absolute -right-1 top-0 w-4 h-3 rounded-r-full"
            style={{
              background: '#e07d7d',
            }}
          />
        </div>
      </div>
    </div>
  );
}
