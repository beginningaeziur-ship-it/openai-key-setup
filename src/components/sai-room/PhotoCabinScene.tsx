import React from 'react';
import cabinBg from '@/assets/cozy-cabin-bg.jpg';
import { RoomHotspot } from './RoomHotspot';

interface PhotoCabinSceneProps {
  onHotspotClick: (objectId: string) => void;
  highlightedHotspot?: string | null;
  activeHotspot?: string | null;
  isVisible?: boolean;
}

export const PhotoCabinScene: React.FC<PhotoCabinSceneProps> = ({
  onHotspotClick,
  highlightedHotspot,
  activeHotspot,
  isVisible = true,
}) => {
  // Hotspot positions mapped to the cabin image
  const hotspots = [
    {
      id: 'fireplace',
      label: 'Fireplace',
      ariaLabel: 'Fireplace - Grounding & emotional tools',
      position: { x: 12, y: 55 },
    },
    {
      id: 'couch',
      label: 'Couch',
      ariaLabel: 'Couch - Rest & check-in',
      position: { x: 55, y: 60 },
    },
    {
      id: 'window',
      label: 'Window',
      ariaLabel: 'Window - View the snow',
      position: { x: 50, y: 30 },
    },
    {
      id: 'lamp',
      label: 'Lamp',
      ariaLabel: 'Lamp - Voice & settings',
      position: { x: 88, y: 55 },
    },
    {
      id: 'bookshelf',
      label: 'Bookshelf',
      ariaLabel: 'Bookshelf - Scripts & resources',
      position: { x: 92, y: 35 },
    },
    {
      id: 'coffee-table',
      label: 'Coffee Table',
      ariaLabel: 'Coffee Table - Tasks & goals',
      position: { x: 50, y: 72 },
    },
    {
      id: 'rug',
      label: 'Rug',
      ariaLabel: 'Rug - Breathing & grounding',
      position: { x: 50, y: 85 },
    },
  ];

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Photorealistic cabin background */}
      <img
        src={cabinBg}
        alt="Cozy log cabin interior with stone fireplace and snowy view"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Warm overlay for atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 via-transparent to-amber-800/10 pointer-events-none" />
      
      {/* Snow effect on window */}
      <div className="absolute top-[10%] left-[35%] w-[30%] h-[35%] pointer-events-none overflow-hidden">
        <div className="snow-overlay absolute inset-0 opacity-30" />
      </div>
      
      {/* Fireplace glow effect */}
      <div 
        className="absolute left-[5%] top-[40%] w-[20%] h-[40%] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,140,50,0.3) 0%, rgba(255,100,30,0.15) 40%, transparent 70%)',
          animation: 'fireGlow 3s ease-in-out infinite alternate',
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

      {/* CSS for fire animation and snow */}
      <style>{`
        @keyframes fireGlow {
          0% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
          100% { opacity: 0.6; transform: scale(1); }
        }
        
        @keyframes snowfall {
          0% { background-position: 0 0, 0 0; }
          100% { background-position: 50px 200px, 100px 400px; }
        }
        
        .snow-overlay {
          background-image: 
            radial-gradient(2px 2px at 20px 30px, white, transparent),
            radial-gradient(2px 2px at 40px 70px, white, transparent),
            radial-gradient(1px 1px at 90px 40px, white, transparent),
            radial-gradient(2px 2px at 130px 80px, white, transparent),
            radial-gradient(1px 1px at 160px 120px, white, transparent);
          background-size: 200px 200px;
          animation: snowfall 8s linear infinite;
        }
      `}</style>
    </div>
  );
};
