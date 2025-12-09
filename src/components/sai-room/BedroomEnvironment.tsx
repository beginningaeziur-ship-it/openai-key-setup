import React from "react";
import { RoomArea } from "./RoomArea";
import { Target, Search, Coffee, Flame, Settings, Wind } from "lucide-react";
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
    style: { left: "18%", bottom: "12%" },
  },
  {
    id: "goals",
    label: "Notebook",
    description: "Your goals & progress",
    icon: Target,
    style: { left: "40%", bottom: "26%" },
  },
  {
    id: "tools",
    label: "Coffee Table",
    description: "Daily tools & routines",
    icon: Coffee,
    style: { left: "55%", bottom: "16%" },
  },
  {
    id: "research",
    label: "Bookshelf",
    description: "Info, scripts & advocacy",
    icon: Search,
    style: { right: "10%", bottom: "28%" },
  },
  {
    id: "settings",
    label: "Lamp",
    description: "How I talk, how much, how fast",
    icon: Settings,
    style: { right: "14%", bottom: "44%" },
  },
  {
    id: "comfort",
    label: "Fireplace",
    description: "Warmth & emotional comfort",
    icon: Flame,
    style: { left: "48%", bottom: "6%" },
  },
];

export const BedroomEnvironment: React.FC<BedroomEnvironmentProps> = ({
  activeArea,
  onAreaSelect,
  isVisible = true,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {hotspots.map((hs, index) => (
        <div
          key={hs.id}
          style={{ position: "absolute", ...hs.style }}
          className="pointer-events-auto"
        >
          <RoomArea
            id={hs.id}
            label={hs.label}
            description={hs.description}
            icon={hs.icon}
            isActive={activeArea === hs.id}
            onClick={() => onAreaSelect(hs.id)}
            isVisible={isVisible}
            animationDelay={index * 0.15}
            className="room-hotspot"
          />
        </div>
      ))}
    </div>
  );
};
