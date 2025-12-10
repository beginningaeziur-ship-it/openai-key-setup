import React from 'react';
import oceanBg from '@/assets/tropical-ocean-bg.jpg';
import { RoomHotspot } from './RoomHotspot';

interface PhotoOceanSceneProps {
  onHotspotClick: (objectId: string) => void;
  highlightedHotspot?: string | null;
  activeHotspot?: string | null;
  isVisible?: boolean;
}

export const PhotoOceanScene: React.FC<PhotoOceanSceneProps> = ({
  onHotspotClick,
  highlightedHotspot,
  activeHotspot,
  isVisible = true,
}) => {
  // Hotspot positions mapped to the ocean image
  const hotspots = [
    {
      id: 'horizon',
      label: 'Horizon',
      ariaLabel: 'Horizon - Breathe & center',
      position: { x: 55, y: 35 },
    },
    {
      id: 'waves',
      label: 'Waves',
      ariaLabel: 'Waves - Grounding rhythm',
      position: { x: 60, y: 55 },
    },
    {
      id: 'boulders',
      label: 'Boulders',
      ariaLabel: 'Boulders - Strength & stability',
      position: { x: 22, y: 50 },
    },
    {
      id: 'palm-tree',
      label: 'Palm Tree',
      ariaLabel: 'Palm Tree - Shelter & rest',
      position: { x: 12, y: 25 },
    },
    {
      id: 'sand',
      label: 'Sand',
      ariaLabel: 'Sand - Grounding exercises',
      position: { x: 35, y: 85 },
    },
    {
      id: 'sunset',
      label: 'Sunset',
      ariaLabel: 'Sunset - Reflect & unwind',
      position: { x: 75, y: 20 },
    },
    {
      id: 'shoreline',
      label: 'Shoreline',
      ariaLabel: 'Shoreline - Tasks & goals',
      position: { x: 50, y: 70 },
    },
  ];

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Photorealistic ocean background */}
      <img
        src={oceanBg}
        alt="Tropical beach at sunset with palm trees and calm ocean"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Warm sunset overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 via-transparent to-cyan-800/10 pointer-events-none" />
      
      {/* Subtle wave shimmer effect */}
      <div 
        className="absolute bottom-[30%] left-0 right-0 h-[20%] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 25%, transparent 50%, rgba(255,255,255,0.08) 75%, transparent 100%)',
          animation: 'waveShimmer 4s ease-in-out infinite',
        }}
      />

      {/* Clickable hotspots */}
      {hotspots.map((hotspot) => (
        <div
          key={hotspot.id}
          className="absolute"
          style={{
            left: `${hotspot.position.x}%`,
            top: `${hotspot.position.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <RoomHotspot
            id={hotspot.id}
            label={hotspot.label}
            ariaLabel={hotspot.ariaLabel}
            onClick={() => onHotspotClick(hotspot.id)}
            isHighlighted={highlightedHotspot === hotspot.id}
            isActive={activeHotspot === hotspot.id}
          />
        </div>
      ))}

      {/* CSS for wave animation */}
      <style>{`
        @keyframes waveShimmer {
          0%, 100% { 
            transform: translateX(-5%);
            opacity: 0.3;
          }
          50% { 
            transform: translateX(5%);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};
