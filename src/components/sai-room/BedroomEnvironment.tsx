import React from "react";
import { BedroomScene } from "./BedroomScene";
import { Target, Search, Coffee, Flame, Settings, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Hotspot {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  style: React.CSSProperties;
}

interface BedroomEnvironmentProps {
  activeArea: string | null;
  onAreaSelect: (id: string) => void;
  isVisible?: boolean;
}

const hotspots: Hotspot[] = [
  {
    id: "grounding",
    label: "Rug",
    description: "Sit, breathe, feel the floor",
    icon: Wind,
    style: { left: "22%", bottom: "8%" },
  },
  {
    id: "goals",
    label: "Notebook",
    description: "Your goals & progress",
    icon: Target,
    style: { left: "52%", bottom: "14%" },
  },
  {
    id: "tools",
    label: "Coffee Table",
    description: "Daily tools & routines",
    icon: Coffee,
    style: { left: "54%", bottom: "22%" },
  },
  {
    id: "research",
    label: "Bookshelf",
    description: "Info, scripts & advocacy",
    icon: Search,
    style: { right: "8%", bottom: "32%" },
  },
  {
    id: "settings",
    label: "Lamp",
    description: "How I talk, how much, how fast",
    icon: Settings,
    style: { right: "22%", bottom: "52%" },
  },
  {
    id: "comfort",
    label: "Fireplace",
    description: "Warmth & emotional comfort",
    icon: Flame,
    style: { left: "50%", bottom: "4%", transform: "translateX(-50%)" },
  },
];

export const BedroomEnvironment: React.FC<BedroomEnvironmentProps> = ({
  activeArea,
  onAreaSelect,
  isVisible = true,
}) => {
  return (
    <div className="absolute inset-0 z-10">
      {/* Actual bedroom visuals */}
      <BedroomScene />
      
      {/* Interactive hotspots overlaying the scene */}
      <div className="absolute inset-0 pointer-events-none">
        {hotspots.map((hs, index) => (
          <button
            key={hs.id}
            onClick={() => onAreaSelect(hs.id)}
            style={{ 
              position: "absolute", 
              ...hs.style,
              animationDelay: `${index * 0.1}s`
            }}
            className={cn(
              "pointer-events-auto group flex items-center gap-2 px-3 py-2 rounded-xl",
              "bg-black/30 backdrop-blur-md border border-white/10",
              "transition-all duration-300 hover:bg-black/50 hover:border-white/20 hover:scale-105",
              "opacity-0 animate-fade-in",
              activeArea === hs.id && "bg-primary/20 border-primary/40 scale-105 shadow-lg shadow-primary/20"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              "bg-gradient-to-br from-white/10 to-white/5",
              "group-hover:from-primary/30 group-hover:to-primary/10",
              activeArea === hs.id && "from-primary/40 to-primary/20"
            )}>
              <hs.icon className={cn(
                "w-4 h-4 text-white/70 group-hover:text-white transition-colors",
                activeArea === hs.id && "text-primary"
              )} />
            </div>
            <div className="text-left">
              <div className={cn(
                "text-xs font-medium text-white/90",
                activeArea === hs.id && "text-primary"
              )}>
                {hs.label}
              </div>
              <div className="text-[10px] text-white/50 group-hover:text-white/70 transition-colors max-w-[100px]">
                {hs.description}
              </div>
            </div>
            {/* Pulse indicator */}
            <div className={cn(
              "absolute -right-1 -top-1 w-2 h-2 rounded-full bg-primary/60",
              "animate-pulse",
              isVisible ? "opacity-100" : "opacity-0"
            )} />
          </button>
        ))}
      </div>
    </div>
  );
};
