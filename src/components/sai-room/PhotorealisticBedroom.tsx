import React from 'react';
import { cn } from '@/lib/utils';
import { RoomHotspot } from './RoomHotspot';

interface PhotorealisticBedroomProps {
  onHotspotClick: (id: string) => void;
  highlightedHotspot?: string | null;
  activeHotspot?: string | null;
}

export const PhotorealisticBedroom: React.FC<PhotorealisticBedroomProps> = ({
  onHotspotClick,
  highlightedHotspot,
  activeHotspot,
}) => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Photorealistic bedroom background layers */}
      
      {/* Base - dark cozy atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0f14] via-[#151821] to-[#0a0c10]" />
      
      {/* Window with rain effect */}
      <div className="absolute top-[8%] right-[8%] w-[18%] h-[35%] rounded-lg overflow-hidden">
        {/* Window frame */}
        <div className="absolute inset-0 border-[6px] border-[#2a2420] rounded-lg z-10" />
        <div className="absolute top-0 bottom-0 left-1/2 w-1 -translate-x-1/2 bg-[#2a2420] z-10" />
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-[#2a2420] z-10" />
        
        {/* Night sky through window */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2030] via-[#252838] to-[#1f2535]" />
        
        {/* Moon glow */}
        <div className="absolute top-[15%] right-[20%] w-8 h-8 bg-[#e8e4d8]/80 rounded-full blur-[2px]" />
        <div className="absolute top-[12%] right-[18%] w-12 h-12 bg-[#a8b4c8]/20 rounded-full blur-xl" />
        
        {/* Rain streaks */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`rain-${i}`}
            className="absolute w-[1px] bg-gradient-to-b from-transparent via-[#6080a0]/30 to-transparent animate-rain"
            style={{
              left: `${5 + (i * 5)}%`,
              height: `${30 + Math.random() * 40}%`,
              top: `${-10 - Math.random() * 20}%`,
              animationDelay: `${i * 0.15}s`,
              animationDuration: `${0.8 + Math.random() * 0.4}s`,
            }}
          />
        ))}
        
        {/* Rain drops on glass */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`drop-${i}`}
            className="absolute w-1 h-2 bg-[#4060a0]/20 rounded-full"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
          />
        ))}
        
        {/* Window ambient glow into room */}
        <div className="absolute -bottom-20 -left-10 -right-10 h-32 bg-gradient-to-t from-transparent via-[#3040607]/10 to-[#405080]/5 blur-2xl" />
      </div>
      
      {/* Wall texture - subtle wallpaper pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 50px,
          rgba(255,255,255,0.02) 50px,
          rgba(255,255,255,0.02) 51px
        )`
      }} />
      
      {/* Curtains */}
      <div className="absolute top-[5%] right-[5%] w-[5%] h-[50%] bg-gradient-to-b from-[#2a3545]/80 via-[#253040]/70 to-[#1f2838]/60 rounded-b-lg" />
      <div className="absolute top-[5%] right-[24%] w-[5%] h-[50%] bg-gradient-to-b from-[#2a3545]/80 via-[#253040]/70 to-[#1f2838]/60 rounded-b-lg" />
      {/* Curtain rod */}
      <div className="absolute top-[4%] right-[4%] w-[26%] h-2 bg-gradient-to-r from-[#3a3025] via-[#4a4035] to-[#3a3025] rounded-full" />
      
      {/* Wall clock */}
      <div className="absolute top-[15%] left-[35%] w-16 h-16">
        {/* Clock face */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#f5f0e8] to-[#e8e0d5] shadow-lg" />
        <div className="absolute inset-1 rounded-full border border-[#c0b8a8]" />
        {/* Hour markers */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`hour-${i}`}
            className="absolute w-0.5 h-1.5 bg-[#3a3530]"
            style={{
              left: '50%',
              top: '8%',
              transformOrigin: '50% 350%',
              transform: `translateX(-50%) rotate(${i * 30}deg)`,
            }}
          />
        ))}
        {/* Hour hand */}
        <div className="absolute left-1/2 bottom-1/2 w-1 h-4 bg-[#2a2520] rounded-full origin-bottom -translate-x-1/2 rotate-[-60deg]" />
        {/* Minute hand */}
        <div className="absolute left-1/2 bottom-1/2 w-0.5 h-5 bg-[#3a3530] rounded-full origin-bottom -translate-x-1/2 rotate-[90deg]" />
        {/* Center dot */}
        <div className="absolute left-1/2 top-1/2 w-1.5 h-1.5 bg-[#2a2520] rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>
      
      {/* Wall art frames */}
      <div className="absolute top-[18%] left-[12%] w-24 h-18 border-4 border-[#3a3025] bg-gradient-to-br from-[#253040]/50 to-[#1a2030]/50 rounded shadow-lg">
        <div className="absolute inset-2 overflow-hidden rounded-sm">
          {/* Abstract art */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#304050]/40 via-[#405060]/30 to-[#253040]/40" />
          <div className="absolute top-2 left-2 w-8 h-6 bg-[#5080a0]/30 rounded-full blur-sm" />
          <div className="absolute bottom-2 right-2 w-10 h-4 bg-[#a08060]/25 rounded blur-sm" />
        </div>
      </div>
      
      {/* Smaller frame */}
      <div className="absolute top-[22%] left-[28%] w-14 h-20 border-3 border-[#352a20] bg-gradient-to-b from-[#2a3545]/40 to-[#1f2838]/40 rounded shadow-md">
        <div className="absolute inset-1.5 bg-gradient-to-b from-[#304050]/30 to-[#1a2535]/30 rounded-sm" />
      </div>
      
      {/* Wooden floor */}
      <div className="absolute bottom-0 left-0 right-0 h-[35%]">
        {/* Floor base color */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a150f] via-[#251c14] to-[#2a2018]" />
        
        {/* Wood planks */}
        {[...Array(14)].map((_, i) => (
          <div
            key={`plank-${i}`}
            className="absolute bottom-0 h-full"
            style={{ left: `${i * 7.14}%`, width: '7.14%' }}
          >
            <div className="h-full bg-gradient-to-r from-[#2a2015]/60 via-[#352a1e]/40 to-[#2a2015]/50 border-r border-[#1a1510]/60" />
            {/* Wood grain */}
            <div className="absolute top-[20%] left-[30%] w-[40%] h-[2px] bg-[#201810]/40 rounded-full" />
            <div className="absolute top-[50%] left-[20%] w-[60%] h-[1px] bg-[#201810]/30 rounded-full" />
            <div className="absolute top-[75%] left-[25%] w-[50%] h-[2px] bg-[#201810]/35 rounded-full" />
          </div>
        ))}
        
        {/* Floor reflection/sheen */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#405060]/5 to-transparent opacity-40" />
      </div>
      
      {/* Large bed - left side */}
      <div className="absolute bottom-[12%] left-[5%] w-[38%] h-[35%]">
        {/* Bed frame base */}
        <div className="absolute bottom-0 w-full h-[12%] bg-gradient-to-t from-[#2a2018] to-[#352a1e] rounded-sm" />
        
        {/* Mattress */}
        <div className="absolute bottom-[10%] w-full h-[18%] bg-gradient-to-t from-[#3a3530] to-[#454038] rounded-t" />
        
        {/* Fitted sheet */}
        <div className="absolute bottom-[20%] w-full h-[30%] bg-gradient-to-t from-[#e8e4dc] via-[#f0ece5] to-[#f5f2eb] rounded-t-lg" />
        
        {/* Duvet/comforter */}
        <div className="absolute bottom-[25%] w-[96%] left-[2%] h-[35%] bg-gradient-to-t from-[#354050] via-[#405565] to-[#455a70] rounded-t-2xl shadow-lg">
          {/* Duvet texture/folds */}
          <div className="absolute top-[30%] left-[20%] w-[30%] h-[20%] bg-[#304050]/40 rounded-full blur-md" />
          <div className="absolute top-[20%] right-[25%] w-[25%] h-[15%] bg-[#506075]/30 rounded-full blur-lg" />
        </div>
        
        {/* Pillows */}
        <div className="absolute bottom-[52%] left-[5%] w-[28%] h-[18%] bg-gradient-to-t from-[#e5e0d8] to-[#f5f2eb] rounded-xl shadow-md transform -rotate-2" />
        <div className="absolute bottom-[54%] left-[35%] w-[28%] h-[18%] bg-gradient-to-t from-[#e8e4dc] to-[#f8f5f0] rounded-xl shadow-md transform rotate-1" />
        
        {/* Headboard */}
        <div className="absolute bottom-[62%] w-full h-[38%] bg-gradient-to-t from-[#352a1e] via-[#3a3025] to-[#403530] rounded-t-2xl">
          {/* Headboard panels */}
          <div className="absolute inset-4 rounded-lg border border-[#4a4035]/30" />
          <div className="absolute top-8 left-8 right-8 bottom-4 rounded border border-[#4a4035]/20" />
        </div>
      </div>
      
      {/* Nightstand - left of bed */}
      <div className="absolute bottom-[12%] left-[44%] w-[8%] h-[18%]">
        {/* Nightstand body */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2a2018] to-[#352a1e] rounded-sm" />
        <div className="absolute top-[5%] left-[5%] right-[5%] h-[2px] bg-[#403530]" />
        {/* Drawer */}
        <div className="absolute top-[35%] left-[10%] right-[10%] h-[30%] border border-[#403530]/40 rounded-sm" />
        <div className="absolute top-[47%] left-[35%] right-[35%] h-1 bg-[#4a4538] rounded-full" />
        
        {/* Table lamp */}
        <div className="absolute -top-[40%] left-[20%] w-[60%]">
          {/* Lamp base */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[50%] h-3 bg-gradient-to-t from-[#3a3025] to-[#4a4035] rounded-full" />
          {/* Lamp stem */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-6 bg-gradient-to-t from-[#4a4035] to-[#5a5045]" />
          {/* Lamp shade */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-10 h-8 bg-gradient-to-b from-[#f5f0e5]/90 to-[#e8e0d5]/80 rounded-t-lg rounded-b-sm" style={{
            clipPath: 'polygon(10% 100%, 90% 100%, 100% 0%, 0% 0%)'
          }} />
          {/* Lamp glow */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-16 bg-[#ffeedd]/15 rounded-full blur-xl" />
        </div>
      </div>
      
      {/* Dresser - right side */}
      <div className="absolute bottom-[12%] right-[8%] w-[18%] h-[28%]">
        {/* Dresser body */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2a2018] via-[#302520] to-[#352a1e] rounded-sm" />
        {/* Dresser top */}
        <div className="absolute top-0 left-0 right-0 h-[5%] bg-gradient-to-b from-[#403530] to-[#352a1e] rounded-t" />
        
        {/* Drawers */}
        {[0, 1, 2].map((i) => (
          <div key={`drawer-${i}`} className="absolute left-[8%] right-[8%]" style={{ top: `${12 + i * 28}%`, height: '24%' }}>
            <div className="absolute inset-0 border border-[#403530]/50 rounded-sm bg-[#302520]/30" />
            {/* Drawer handles */}
            <div className="absolute top-1/2 left-[30%] right-[30%] h-1 bg-[#5a5045] rounded-full -translate-y-1/2" />
          </div>
        ))}
        
        {/* Items on dresser */}
        <div className="absolute -top-[8%] left-[15%] w-6 h-8 bg-gradient-to-t from-[#405060]/60 to-[#506575]/50 rounded" /> {/* Small frame */}
        <div className="absolute -top-[5%] right-[20%] w-4 h-5 bg-gradient-to-t from-[#304045]/50 to-[#405055]/40 rounded-sm" /> {/* Box */}
      </div>
      
      {/* Cozy rug - center floor */}
      <div className="absolute bottom-[8%] left-[30%] w-[35%] h-[15%]">
        {/* Rug base */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#3a3040]/60 via-[#4a3545]/50 to-[#3a3040]/60 rounded-[50%] blur-[1px]" />
        {/* Rug pattern */}
        <div className="absolute inset-[15%] rounded-[50%] border border-[#5a4555]/30" />
        <div className="absolute inset-[30%] rounded-[50%] border border-[#6a5565]/25" />
        {/* Rug texture */}
        <div className="absolute inset-0 rounded-[50%] opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(80,60,70,0.3) 0%, transparent 50%)'
        }} />
      </div>
      
      {/* Ambient lighting effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Warm lamp glow */}
        <div className="absolute top-[25%] left-[46%] w-40 h-40 bg-[#ffeedd]/10 rounded-full blur-3xl" />
        
        {/* Window moonlight spill */}
        <div className="absolute top-[10%] right-[5%] w-60 h-80 bg-[#405080]/5 rounded-full blur-3xl transform rotate-12" />
        
        {/* Floor reflection */}
        <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-transparent via-[#304050]/3 to-transparent" />
      </div>
      
      {/* Floating dust particles in light beams */}
      {[...Array(15)].map((_, i) => (
        <div
          key={`dust-${i}`}
          className="absolute w-0.5 h-0.5 bg-[#a0b0c0]/20 rounded-full animate-float"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 60}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${5 + Math.random() * 4}s`,
          }}
        />
      ))}
      
      {/* Interactive Hotspots */}
      <div className="absolute inset-0">
        {/* Bed hotspot */}
        <RoomHotspot
          id="bed"
          label="Rest & Grounding"
          onClick={() => onHotspotClick('bed')}
          isHighlighted={highlightedHotspot === 'bed'}
          isActive={activeHotspot === 'bed'}
          className="absolute bottom-[28%] left-[18%]"
          ariaLabel="Bed - Opens Rest and Grounding tools for breathing exercises, body scan, and rest-mode"
        />
        
        {/* Dresser hotspot */}
        <RoomHotspot
          id="dresser"
          label="Daily Living"
          onClick={() => onHotspotClick('dresser')}
          isHighlighted={highlightedHotspot === 'dresser'}
          isActive={activeHotspot === 'dresser'}
          className="absolute bottom-[28%] right-[14%]"
          ariaLabel="Dresser - Opens Daily Living Tasks panel for hygiene, clothes, and self-care routines"
        />
        
        {/* Wall Art hotspot */}
        <RoomHotspot
          id="wall-art"
          label="Emotions & Thoughts"
          onClick={() => onHotspotClick('wall-art')}
          isHighlighted={highlightedHotspot === 'wall-art'}
          isActive={activeHotspot === 'wall-art'}
          className="absolute top-[22%] left-[18%]"
          ariaLabel="Wall Art - Opens Emotions and Thoughts panel for CBT tools, reframes, and journaling"
        />
        
        {/* Clock hotspot */}
        <RoomHotspot
          id="clock"
          label="Time & Reminders"
          onClick={() => onHotspotClick('clock')}
          isHighlighted={highlightedHotspot === 'clock'}
          isActive={activeHotspot === 'clock'}
          className="absolute top-[16%] left-[38%]"
          ariaLabel="Clock - Opens Time and Reminders panel for appointments, meds, and deadlines"
        />
        
        {/* Nightstand hotspot */}
        <RoomHotspot
          id="nightstand"
          label="Today Check-In"
          onClick={() => onHotspotClick('nightstand')}
          isHighlighted={highlightedHotspot === 'nightstand'}
          isActive={activeHotspot === 'nightstand'}
          className="absolute bottom-[22%] left-[46%]"
          ariaLabel="Nightstand - Opens Today Check-In panel for mood, safety, and quick status"
        />
        
        {/* Lamp hotspot */}
        <RoomHotspot
          id="lamp"
          label="Calm Settings"
          onClick={() => onHotspotClick('lamp')}
          isHighlighted={highlightedHotspot === 'lamp'}
          isActive={activeHotspot === 'lamp'}
          className="absolute bottom-[35%] left-[45%]"
          ariaLabel="Lamp - Opens Calm Settings panel for brightness, sound volume, and calm mode"
        />
        
        {/* Rug hotspot */}
        <RoomHotspot
          id="rug"
          label="Grounding Tools"
          onClick={() => onHotspotClick('rug')}
          isHighlighted={highlightedHotspot === 'rug'}
          isActive={activeHotspot === 'rug'}
          className="absolute bottom-[12%] left-[45%]"
          ariaLabel="Rug - Opens Grounding Tools panel for 5-senses grounding, orientation, and dissociation support"
        />
        
        {/* Window hotspot */}
        <RoomHotspot
          id="window"
          label="Look Outside"
          onClick={() => onHotspotClick('window')}
          isHighlighted={highlightedHotspot === 'window'}
          isActive={activeHotspot === 'window'}
          className="absolute top-[22%] right-[14%]"
          ariaLabel="Window - Opens Look Outside panel for visual grounding and perspective exercises"
        />
      </div>
      
      {/* Rain animation styles */}
      <style>{`
        @keyframes rain {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(300%);
            opacity: 0;
          }
        }
        .animate-rain {
          animation: rain linear infinite;
        }
      `}</style>
    </div>
  );
};
