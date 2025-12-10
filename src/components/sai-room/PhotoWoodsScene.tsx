import React from 'react';
import forestBg from '@/assets/forest-woods-bg.jpg';
import { RoomHotspot } from './RoomHotspot';

interface PhotoWoodsSceneProps {
  onHotspotClick: (objectId: string) => void;
  highlightedHotspot?: string | null;
  activeHotspot?: string | null;
  isVisible?: boolean;
}

export const PhotoWoodsScene: React.FC<PhotoWoodsSceneProps> = ({
  onHotspotClick,
  highlightedHotspot,
  activeHotspot,
  isVisible = true,
}) => {
  // Hotspot positions mapped to the forest image
  const hotspots = [
    {
      id: 'tent',
      label: 'Tent',
      ariaLabel: 'Tent - Rest & shelter',
      position: { x: 50, y: 70 },
    },
    {
      id: 'lake',
      label: 'Lake',
      ariaLabel: 'Lake - Calm & reflection',
      position: { x: 50, y: 50 },
    },
    {
      id: 'mountains',
      label: 'Mountains',
      ariaLabel: 'Mountains - Perspective & goals',
      position: { x: 50, y: 25 },
    },
    {
      id: 'pine-tree',
      label: 'Pine Tree',
      ariaLabel: 'Pine Tree - Grounding & stability',
      position: { x: 12, y: 45 },
    },
    {
      id: 'moon',
      label: 'Moon',
      ariaLabel: 'Moon - Night routine & rest',
      position: { x: 50, y: 12 },
    },
    {
      id: 'forest-floor',
      label: 'Forest Floor',
      ariaLabel: 'Forest Floor - Grounding exercises',
      position: { x: 30, y: 85 },
    },
    {
      id: 'mist',
      label: 'Mist',
      ariaLabel: 'Mist - Breathing & calm',
      position: { x: 75, y: 40 },
    },
  ];

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Photorealistic forest background */}
      <img
        src={forestBg}
        alt="Mountain forest at dusk with glowing tent by calm lake"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Twilight overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 via-transparent to-slate-900/20 pointer-events-none" />
      
      {/* Tent glow effect */}
      <div 
        className="absolute left-[45%] top-[60%] w-[15%] h-[25%] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,180,100,0.2) 0%, rgba(255,150,80,0.1) 40%, transparent 70%)',
          animation: 'tentGlow 4s ease-in-out infinite alternate',
        }}
      />
      
      {/* Subtle mist animation */}
      <div 
        className="absolute top-[30%] left-0 right-0 h-[20%] pointer-events-none opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.1) 70%, transparent 100%)',
          animation: 'mistDrift 8s ease-in-out infinite',
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

      {/* CSS for animations */}
      <style>{`
        @keyframes tentGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.9; }
        }
        
        @keyframes mistDrift {
          0%, 100% { 
            transform: translateX(-3%);
            opacity: 0.2;
          }
          50% { 
            transform: translateX(3%);
            opacity: 0.35;
          }
        }
      `}</style>
    </div>
  );
};
