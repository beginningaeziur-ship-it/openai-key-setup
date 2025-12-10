import React from 'react';
import { cn } from '@/lib/utils';
import cozyBedroomBg from '@/assets/cozy-bedroom-bg.jpg';

interface PhotoBedroomSceneProps {
  onHotspotClick: (id: string) => void;
  highlightedHotspot?: string | null;
  activeHotspot?: string | null;
  isVisible?: boolean;
}

interface HotspotConfig {
  id: string;
  label: string;
  ariaLabel: string;
  position: { top: string; left: string };
}

const hotspots: HotspotConfig[] = [
  {
    id: 'fireplace',
    label: 'Comfort & Soothing',
    ariaLabel: 'Fireplace - Opens Comfort and Soothing tools',
    position: { top: '55%', left: '8%' },
  },
  {
    id: 'bookshelf',
    label: 'Resources',
    ariaLabel: 'Bookshelf - Opens Resources and Learning',
    position: { top: '35%', left: '5%' },
  },
  {
    id: 'rug',
    label: 'Grounding',
    ariaLabel: 'Rug - Opens Grounding Tools',
    position: { top: '75%', left: '35%' },
  },
  {
    id: 'bed',
    label: 'Rest & Breathing',
    ariaLabel: 'Bed - Opens Rest and Grounding tools',
    position: { top: '50%', left: '65%' },
  },
  {
    id: 'nightstand',
    label: 'Check-In',
    ariaLabel: 'Nightstand - Opens Today Check-In',
    position: { top: '45%', left: '88%' },
  },
  {
    id: 'lamp',
    label: 'Settings',
    ariaLabel: 'Lamp - Opens Calm Settings panel',
    position: { top: '35%', left: '92%' },
  },
  {
    id: 'window',
    label: 'Look Outside',
    ariaLabel: 'Window - Opens Look Outside for visual grounding',
    position: { top: '30%', left: '50%' },
  },
  {
    id: 'wall-art',
    label: 'Emotions',
    ariaLabel: 'Wall Art - Opens Emotions and Thoughts panel',
    position: { top: '25%', left: '85%' },
  },
];

export const PhotoBedroomScene: React.FC<PhotoBedroomSceneProps> = ({
  onHotspotClick,
  highlightedHotspot,
  activeHotspot,
  isVisible = true,
}) => {
  return (
    <div className={cn(
      "absolute inset-0 overflow-hidden",
      "transition-opacity duration-1000",
      isVisible ? "opacity-100" : "opacity-0"
    )}>
      {/* Photo background */}
      <img 
        src={cozyBedroomBg} 
        alt="Cozy cabin bedroom" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Dark overlay for better hotspot visibility */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Rain animation overlay on window area */}
      <div className="absolute top-0 left-[20%] right-[20%] h-[60%] overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={`rain-${i}`}
            className="absolute w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent animate-rain"
            style={{
              left: `${Math.random() * 100}%`,
              height: `${20 + Math.random() * 30}%`,
              top: `${-20 - Math.random() * 20}%`,
              animationDelay: `${i * 0.08}s`,
              animationDuration: `${0.5 + Math.random() * 0.3}s`,
            }}
          />
        ))}
      </div>
      
      {/* Fire glow effect */}
      <div className="absolute bottom-[20%] left-0 w-[30%] h-[50%] bg-gradient-to-r from-orange-500/15 via-orange-400/10 to-transparent pointer-events-none animate-fire-glow" />

      {/* Clickable Hotspots */}
      {hotspots.map((hotspot) => {
        const isHighlighted = highlightedHotspot === hotspot.id;
        const isActive = activeHotspot === hotspot.id;
        
        return (
          <button
            key={hotspot.id}
            onClick={() => onHotspotClick(hotspot.id)}
            aria-label={hotspot.ariaLabel}
            className={cn(
              "absolute z-30 group",
              "transition-all duration-300 ease-out",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            )}
            style={{ 
              top: hotspot.position.top, 
              left: hotspot.position.left,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Hotspot indicator */}
            <div className={cn(
              "relative w-12 h-12 rounded-full cursor-pointer",
              "bg-white/10 backdrop-blur-sm border-2 border-white/30",
              "hover:bg-white/20 hover:border-white/50 hover:scale-110",
              "transition-all duration-300",
              isHighlighted && "animate-pulse bg-primary/40 border-primary scale-125 shadow-[0_0_30px_hsl(var(--primary)/0.6)]",
              isActive && "bg-primary/50 border-primary shadow-[0_0_20px_hsl(var(--primary)/0.5)]",
            )}>
              {/* Inner glow */}
              <div className={cn(
                "absolute inset-2 rounded-full bg-white/30",
                isHighlighted && "animate-ping bg-primary/50"
              )} />
            </div>
            
            {/* Label tooltip */}
            <div className={cn(
              "absolute left-1/2 -translate-x-1/2 -top-10",
              "px-3 py-1.5 rounded-lg",
              "bg-black/80 backdrop-blur-md border border-white/20",
              "text-xs font-medium text-white whitespace-nowrap",
              "opacity-0 translate-y-2 pointer-events-none",
              "group-hover:opacity-100 group-hover:translate-y-0",
              "group-focus:opacity-100 group-focus:translate-y-0",
              "transition-all duration-200",
              isHighlighted && "opacity-100 translate-y-0"
            )}>
              {hotspot.label}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-black/80 border-r border-b border-white/20 rotate-45" />
            </div>
          </button>
        );
      })}

      {/* Ambient particles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={`dust-${i}`}
          className="absolute w-1 h-1 bg-orange-200/20 rounded-full animate-float pointer-events-none"
          style={{
            left: `${5 + Math.random() * 40}%`,
            top: `${30 + Math.random() * 40}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${5 + Math.random() * 4}s`,
          }}
        />
      ))}

      {/* Animations */}
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
        @keyframes fire-glow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        .animate-fire-glow {
          animation: fire-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
