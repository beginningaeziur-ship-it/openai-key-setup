import React from "react";
import { RoomArea } from "./RoomArea";
import { Target, Search, Coffee, Flame, Settings, Wind, Book, Bed, TreePine, Waves, Moon, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Hotspot {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  style: React.CSSProperties;
}

interface SceneEnvironmentProps {
  scene: string;
  activeArea: string | null;
  handleAreaClick: (id: string) => void;
  isVisible?: boolean;
}

const hotspots: Record<string, Hotspot[]> = {
  bedroom: [
    {
      id: "grounding",
      label: "Rug",
      description: "Sit, breathe, feel the floor",
      icon: Wind,
      style: { left: "20%", bottom: "12%" },
    },
    {
      id: "goals",
      label: "Notebook",
      description: "Your goals",
      icon: Target,
      style: { left: "40%", bottom: "28%" },
    },
    {
      id: "tools",
      label: "Coffee Table",
      description: "Daily tools & routines",
      icon: Coffee,
      style: { left: "55%", bottom: "18%" },
    },
    {
      id: "research",
      label: "Bookshelf",
      description: "Info & advocacy",
      icon: Search,
      style: { right: "10%", bottom: "30%" },
    },
    {
      id: "settings",
      label: "Lamp",
      description: "Voice, pace, tone",
      icon: Settings,
      style: { right: "16%", bottom: "45%" },
    },
    {
      id: "comfort",
      label: "Fireplace",
      description: "Calming warmth",
      icon: Flame,
      style: { left: "48%", bottom: "6%" },
    },
  ],
  cabin: [
    {
      id: "grounding",
      label: "Hearth Rug",
      description: "Feel the warmth beneath you",
      icon: Wind,
      style: { left: "25%", bottom: "15%" },
    },
    {
      id: "goals",
      label: "Journal",
      description: "Your quiet plans",
      icon: Book,
      style: { left: "15%", bottom: "35%" },
    },
    {
      id: "tools",
      label: "Wooden Table",
      description: "Simple daily tools",
      icon: Coffee,
      style: { left: "50%", bottom: "20%" },
    },
    {
      id: "research",
      label: "Cabin Shelf",
      description: "Wisdom & guides",
      icon: Search,
      style: { right: "15%", bottom: "40%" },
    },
    {
      id: "settings",
      label: "Oil Lamp",
      description: "Adjust the glow",
      icon: Settings,
      style: { right: "20%", bottom: "55%" },
    },
    {
      id: "comfort",
      label: "Fireplace",
      description: "Crackling warmth",
      icon: Flame,
      style: { left: "45%", bottom: "8%" },
    },
  ],
  ocean: [
    {
      id: "grounding",
      label: "Sandy Shore",
      description: "Feel the sand, hear the waves",
      icon: Waves,
      style: { left: "20%", bottom: "10%" },
    },
    {
      id: "goals",
      label: "Driftwood Log",
      description: "Sit and reflect",
      icon: Target,
      style: { left: "35%", bottom: "18%" },
    },
    {
      id: "tools",
      label: "Beach Blanket",
      description: "Your daily anchors",
      icon: Coffee,
      style: { left: "55%", bottom: "12%" },
    },
    {
      id: "research",
      label: "Tide Pool",
      description: "Explore and learn",
      icon: Search,
      style: { right: "18%", bottom: "20%" },
    },
    {
      id: "settings",
      label: "Sunset",
      description: "Adjust the light",
      icon: Sun,
      style: { right: "10%", top: "25%" },
    },
    {
      id: "comfort",
      label: "Warm Breeze",
      description: "Let it soothe you",
      icon: Wind,
      style: { left: "45%", bottom: "25%" },
    },
  ],
  woods: [
    {
      id: "grounding",
      label: "Mossy Stone",
      description: "Rest here, feel rooted",
      icon: TreePine,
      style: { left: "18%", bottom: "15%" },
    },
    {
      id: "goals",
      label: "Trail Marker",
      description: "Your path forward",
      icon: Target,
      style: { left: "38%", bottom: "25%" },
    },
    {
      id: "tools",
      label: "Clearing",
      description: "Pause and prepare",
      icon: Coffee,
      style: { left: "55%", bottom: "18%" },
    },
    {
      id: "research",
      label: "Old Oak",
      description: "Ancient wisdom",
      icon: Search,
      style: { right: "12%", bottom: "35%" },
    },
    {
      id: "settings",
      label: "Moonlight",
      description: "Shift the mood",
      icon: Moon,
      style: { right: "15%", top: "20%" },
    },
    {
      id: "comfort",
      label: "Stream",
      description: "Listen to the water",
      icon: Waves,
      style: { left: "30%", bottom: "8%" },
    },
  ],
};

export function SceneEnvironment({ scene, activeArea, handleAreaClick, isVisible = true }: SceneEnvironmentProps) {
  const sceneHotspots = hotspots[scene] || hotspots.bedroom;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {sceneHotspots.map((hs, index) => (
        <div
          key={hs.id}
          style={{
            position: "absolute",
            ...hs.style,
          }}
          className="pointer-events-auto"
        >
          <RoomArea
            id={hs.id}
            label={hs.label}
            description={hs.description}
            icon={hs.icon}
            isActive={activeArea === hs.id}
            onClick={() => handleAreaClick(hs.id)}
            isVisible={isVisible}
            animationDelay={index * 0.15}
          />
        </div>
      ))}
    </div>
  );
}
