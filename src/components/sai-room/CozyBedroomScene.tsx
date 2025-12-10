import React from 'react';
import { cn } from '@/lib/utils';
import { RoomHotspot } from './RoomHotspot';

interface CozyBedroomSceneProps {
  onHotspotClick: (id: string) => void;
  highlightedHotspot?: string | null;
  activeHotspot?: string | null;
  isVisible?: boolean;
}

export const CozyBedroomScene: React.FC<CozyBedroomSceneProps> = ({
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
      {/* Base dark atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0806] via-[#110e0b] to-[#0d0a08]" />
      
      {/* Wooden cabin walls - warm wood texture */}
      <div className="absolute inset-0 opacity-40">
        {[...Array(12)].map((_, i) => (
          <div
            key={`plank-wall-${i}`}
            className="absolute w-full"
            style={{ 
              top: `${i * 8.33}%`, 
              height: '8.33%',
              background: `linear-gradient(90deg, 
                rgba(45,32,20,0.6) 0%, 
                rgba(60,42,28,0.5) 25%, 
                rgba(50,35,22,0.55) 50%, 
                rgba(55,38,25,0.5) 75%, 
                rgba(45,32,20,0.6) 100%)`,
              borderBottom: '1px solid rgba(30,20,12,0.4)'
            }}
          />
        ))}
      </div>

      {/* Slanted wooden ceiling beams */}
      <div className="absolute top-0 left-0 right-0 h-[15%]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a1f15] to-transparent opacity-60" />
        {[...Array(5)].map((_, i) => (
          <div
            key={`beam-${i}`}
            className="absolute h-4 bg-gradient-to-b from-[#3d2a1a] to-[#2a1c10]"
            style={{
              left: `${i * 25}%`,
              right: `${100 - (i + 1) * 25}%`,
              top: '0',
              transform: 'skewY(-3deg)',
              borderBottom: '2px solid rgba(20,12,8,0.5)'
            }}
          />
        ))}
      </div>

      {/* Large panoramic window with rainy forest view */}
      <div className="absolute top-[5%] right-[5%] w-[45%] h-[55%] rounded-lg overflow-hidden">
        {/* Window frame - thick wooden frame */}
        <div className="absolute inset-0 border-[8px] border-[#2a1f15] rounded-lg z-10" />
        <div className="absolute top-0 bottom-0 left-1/3 w-2 bg-[#2a1f15] z-10" />
        <div className="absolute top-0 bottom-0 right-1/3 w-2 bg-[#2a1f15] z-10" />
        <div className="absolute left-0 right-0 top-1/2 h-2 bg-[#2a1f15] z-10" />
        
        {/* Misty forest view */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2025] via-[#202830] to-[#253035]" />
        
        {/* Distant trees silhouettes */}
        <div className="absolute bottom-[20%] left-[5%] w-[15%] h-[60%] bg-[#152020]/80 rounded-t-full" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
        <div className="absolute bottom-[15%] left-[15%] w-[12%] h-[70%] bg-[#1a2525]/70 rounded-t-full" style={{ clipPath: 'polygon(50% 0%, 10% 100%, 90% 100%)' }} />
        <div className="absolute bottom-[25%] left-[25%] w-[18%] h-[55%] bg-[#152020]/75" style={{ clipPath: 'polygon(50% 0%, 5% 100%, 95% 100%)' }} />
        <div className="absolute bottom-[10%] right-[20%] w-[20%] h-[75%] bg-[#1a2525]/65" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
        <div className="absolute bottom-[18%] right-[5%] w-[16%] h-[65%] bg-[#152020]/70" style={{ clipPath: 'polygon(50% 0%, 8% 100%, 92% 100%)' }} />
        
        {/* Mist layers */}
        <div className="absolute bottom-[30%] left-0 right-0 h-[30%] bg-gradient-to-t from-[#405060]/40 to-transparent" />
        <div className="absolute bottom-[40%] left-[10%] right-[10%] h-[20%] bg-[#506070]/20 blur-lg" />
        
        {/* Rain streaks on glass */}
        {[...Array(30)].map((_, i) => (
          <div
            key={`rain-${i}`}
            className="absolute w-[1px] bg-gradient-to-b from-transparent via-[#8090a0]/25 to-transparent animate-rain"
            style={{
              left: `${3 + (i * 3.2)}%`,
              height: `${25 + Math.random() * 35}%`,
              top: `${-15 - Math.random() * 20}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: `${0.6 + Math.random() * 0.3}s`,
            }}
          />
        ))}
        
        {/* Rain droplets on glass */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`drop-${i}`}
            className="absolute rounded-full bg-[#6080a0]/15"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${3 + Math.random() * 5}px`,
              left: `${5 + Math.random() * 90}%`,
              top: `${5 + Math.random() * 90}%`,
            }}
          />
        ))}
        
        {/* Window reflection/glare */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#ffffff]/5 via-transparent to-transparent" />
      </div>

      {/* Balcony railing visible through window */}
      <div className="absolute top-[52%] right-[8%] w-[40%] h-4">
        <div className="absolute inset-0 bg-[#2a2015] rounded" />
        {[...Array(8)].map((_, i) => (
          <div
            key={`rail-${i}`}
            className="absolute w-1.5 h-12 -top-10 bg-[#3a2a1a]"
            style={{ left: `${10 + i * 12}%` }}
          />
        ))}
      </div>

      {/* Fireplace - left side */}
      <div className="absolute bottom-[8%] left-[2%] w-[18%] h-[40%]">
        {/* Fireplace stone surround */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#252018] via-[#302520] to-[#252018] rounded-t-lg" />
        <div className="absolute top-0 left-0 right-0 h-[10%] bg-[#3a3025] rounded-t-lg" /> {/* Mantel */}
        
        {/* Fireplace opening */}
        <div className="absolute bottom-[5%] left-[15%] right-[15%] h-[60%] bg-[#0a0605] rounded-t-lg">
          {/* Fire glow base */}
          <div className="absolute bottom-0 left-[10%] right-[10%] h-[40%] bg-gradient-to-t from-[#ff6020]/60 via-[#ff8040]/40 to-transparent rounded-t-full blur-sm" />
          
          {/* Animated flames */}
          <div className="absolute bottom-[5%] left-[20%] w-[25%] h-[50%] bg-gradient-to-t from-[#ff4010] via-[#ff8030] to-[#ffb050]/50 rounded-t-full animate-fire-1 blur-[1px]" />
          <div className="absolute bottom-[5%] left-[40%] w-[20%] h-[60%] bg-gradient-to-t from-[#ff3000] via-[#ff6020] to-[#ffa040]/40 rounded-t-full animate-fire-2 blur-[1px]" />
          <div className="absolute bottom-[5%] right-[25%] w-[22%] h-[45%] bg-gradient-to-t from-[#ff5015] via-[#ff7030] to-[#ffb050]/30 rounded-t-full animate-fire-3 blur-[1px]" />
          
          {/* Logs */}
          <div className="absolute bottom-[3%] left-[15%] w-[70%] h-3 bg-gradient-to-r from-[#2a1a0a] via-[#3a2515] to-[#2a1a0a] rounded-full" />
          <div className="absolute bottom-[8%] left-[25%] w-[50%] h-2.5 bg-gradient-to-r from-[#3a2515] via-[#4a3020] to-[#3a2515] rounded-full rotate-12" />
          
          {/* Embers */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`ember-${i}`}
              className="absolute w-1 h-1 bg-[#ff6030] rounded-full animate-ember"
              style={{
                bottom: `${10 + Math.random() * 30}%`,
                left: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
        
        {/* Fire light cast */}
        <div className="absolute -right-20 bottom-0 w-40 h-40 bg-[#ff6030]/10 rounded-full blur-3xl animate-fire-glow" />
      </div>

      {/* Cozy floor bed/mattress area - center */}
      <div className="absolute bottom-[5%] left-[25%] w-[45%] h-[25%]">
        {/* Mattress base */}
        <div className="absolute bottom-0 w-full h-[30%] bg-gradient-to-t from-[#e8e0d5]/90 via-[#f0e8dd]/80 to-[#f5efe5]/70 rounded-lg" />
        
        {/* Cozy blankets layered */}
        <div className="absolute bottom-[15%] left-[5%] w-[90%] h-[50%] bg-gradient-to-t from-[#d5c8b8]/80 via-[#c8baa8]/70 to-[#bfb095]/50 rounded-t-2xl" />
        <div className="absolute bottom-[25%] left-[8%] w-[60%] h-[35%] bg-gradient-to-r from-[#8a7a68]/60 to-[#9a8978]/40 rounded-xl" />
        
        {/* Knit texture blanket */}
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-[#c8b8a0]/50" />
          {[...Array(8)].map((_, i) => (
            <div
              key={`knit-${i}`}
              className="absolute h-full w-[12%] bg-[#b8a890]/30"
              style={{ left: `${i * 12.5}%` }}
            />
          ))}
        </div>
        
        {/* Pillows and cushions */}
        <div className="absolute bottom-[55%] left-[10%] w-[25%] h-[30%] bg-gradient-to-br from-[#e0d8cc]/80 to-[#d0c8bc]/70 rounded-2xl rotate-[-8deg]" />
        <div className="absolute bottom-[50%] left-[30%] w-[20%] h-[28%] bg-gradient-to-br from-[#d8d0c5]/75 to-[#c8c0b5]/65 rounded-2xl rotate-[5deg]" />
        <div className="absolute bottom-[45%] left-[48%] w-[18%] h-[25%] bg-gradient-to-br from-[#c5baa8]/70 to-[#b5aa98]/60 rounded-xl rotate-[-3deg]" />
        
        {/* Throw pillow with pattern */}
        <div className="absolute bottom-[35%] right-[15%] w-[15%] h-[22%] bg-[#a09080]/60 rounded-lg rotate-[12deg]" />
      </div>

      {/* Cozy round rug */}
      <div className="absolute bottom-[3%] left-[35%] w-[30%] h-[12%]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#8a7560]/50 via-[#7a6550]/45 to-[#6a5540]/40 rounded-[50%] blur-[1px]" />
        <div className="absolute inset-[15%] rounded-[50%] border border-[#9a8570]/30" />
        <div className="absolute inset-[30%] rounded-[50%] border border-[#a89580]/25" />
        {/* Star pattern */}
        <div className="absolute inset-[40%] bg-[#b8a890]/20 rounded-[50%]" />
      </div>

      {/* Candles scattered around */}
      {/* Candle group - near window */}
      <div className="absolute bottom-[12%] right-[8%] flex gap-3">
        {[0, 1, 2].map((i) => (
          <div key={`candle-r-${i}`} className="relative">
            <div 
              className="w-2 bg-[#f5f0e8]/90 rounded-t"
              style={{ height: `${20 + i * 8}px` }}
            />
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-gradient-to-t from-[#ff8030] via-[#ffb060] to-[#fff0a0] rounded-full animate-candle blur-[0.5px]" />
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#ffa040]/20 rounded-full blur-lg" />
          </div>
        ))}
      </div>

      {/* Candle lanterns on floor */}
      <div className="absolute bottom-[8%] right-[25%]">
        <div className="w-8 h-12 border-2 border-[#3a3025]/60 bg-[#1a1510]/40 rounded-lg relative">
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-4 bg-[#f5f0e8]/80 rounded-t" />
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-1.5 h-2.5 bg-gradient-to-t from-[#ff8030] to-[#ffb060] rounded-full animate-candle" />
          <div className="absolute inset-0 bg-[#ff9040]/10 rounded-lg" />
        </div>
      </div>

      {/* More floor candles near bed */}
      <div className="absolute bottom-[6%] left-[68%] flex gap-2">
        {[0, 1].map((i) => (
          <div key={`candle-f-${i}`} className="relative">
            <div className="w-3 h-6 bg-[#f0e8dd]/85 rounded-t" />
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-3 bg-gradient-to-t from-[#ff7020] via-[#ffa050] to-[#ffe080] rounded-full animate-candle blur-[0.5px]" style={{ animationDelay: `${i * 0.5}s` }} />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#ff9030]/15 rounded-full blur-xl" />
          </div>
        ))}
      </div>

      {/* Bookshelf - left wall */}
      <div className="absolute top-[20%] left-[2%] w-[12%] h-[35%]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#2a1f15] via-[#352a1e] to-[#2a1f15] rounded" />
        {/* Shelves */}
        {[0, 1, 2, 3].map((i) => (
          <div key={`shelf-${i}`} className="absolute left-[5%] right-[5%] h-1.5 bg-[#3a2a1e]" style={{ top: `${20 + i * 22}%` }}>
            {/* Books */}
            <div className="absolute -top-6 left-1 w-3 h-5 bg-[#6a4030]/70 rounded-sm" />
            <div className="absolute -top-5 left-5 w-2.5 h-4 bg-[#304050]/60 rounded-sm" />
            <div className="absolute -top-6 left-8 w-2 h-5 bg-[#504030]/70 rounded-sm" />
            {i < 2 && <div className="absolute -top-4 right-2 w-4 h-3 bg-[#405040]/50 rounded-sm" />}
          </div>
        ))}
      </div>

      {/* Small lamp on shelf/table */}
      <div className="absolute top-[30%] left-[15%]">
        <div className="w-8 h-10 relative">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-2 bg-[#3a3025] rounded" />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-4 bg-[#4a4035]" />
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-8 h-6 bg-gradient-to-b from-[#fff8e8]/80 to-[#f0e0c0]/60 rounded-t-full" style={{ clipPath: 'polygon(15% 100%, 85% 100%, 100% 0%, 0% 0%)' }} />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-10 bg-[#ffeedd]/15 rounded-full blur-xl" />
        </div>
      </div>

      {/* Nightstand with items */}
      <div className="absolute bottom-[15%] left-[22%] w-[8%] h-[15%]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#2a1f15] to-[#352a1e] rounded" />
        <div className="absolute top-[40%] left-[10%] right-[10%] h-1 bg-[#4a3a2a] rounded" />
        {/* Items on top */}
        <div className="absolute -top-3 left-[20%] w-4 h-5 bg-[#f0e8dd]/70 rounded" /> {/* Small jar */}
        <div className="absolute -top-4 right-[15%] w-3 h-6 bg-[#e8e0d5]/60 rounded-t" /> {/* Candle */}
        <div className="absolute -top-2 right-[18%] w-1.5 h-2 bg-[#ff9040]/80 rounded-full animate-candle blur-[0.5px]" />
      </div>

      {/* Plant in corner */}
      <div className="absolute bottom-[10%] right-[3%]">
        <div className="w-12 h-10 bg-gradient-to-t from-[#3a3025] to-[#4a4035] rounded-lg relative" />
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-20 h-16">
          {[...Array(5)].map((_, i) => (
            <div
              key={`leaf-${i}`}
              className="absolute w-8 h-12 bg-gradient-to-t from-[#2a4030]/60 to-[#3a5040]/40 rounded-full"
              style={{
                left: '50%',
                bottom: '0',
                transformOrigin: 'bottom center',
                transform: `translateX(-50%) rotate(${-40 + i * 20}deg)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Wall art / frames */}
      <div className="absolute top-[22%] left-[35%] w-16 h-12 border-4 border-[#3a2a1e] bg-[#1a1510]/60 rounded">
        <div className="absolute inset-2 bg-gradient-to-br from-[#304050]/30 to-[#203040]/20 rounded-sm" />
      </div>
      <div className="absolute top-[18%] left-[48%] w-12 h-16 border-3 border-[#352a1e] bg-[#1a1510]/50 rounded">
        <div className="absolute inset-1.5 bg-gradient-to-br from-[#405040]/25 to-[#304030]/15 rounded-sm" />
      </div>

      {/* String lights along the wall */}
      <div className="absolute top-[15%] left-[30%] right-[50%]">
        <svg className="w-full h-8" viewBox="0 0 200 30">
          <path
            d="M0,15 Q50,25 100,15 T200,15"
            fill="none"
            stroke="rgba(80,60,40,0.4)"
            strokeWidth="1"
          />
        </svg>
        {[...Array(6)].map((_, i) => (
          <div
            key={`light-${i}`}
            className="absolute w-2 h-2 rounded-full animate-twinkle"
            style={{
              left: `${10 + i * 16}%`,
              top: `${50 + Math.sin(i * 0.8) * 20}%`,
              background: 'radial-gradient(circle, #ffe8c0 0%, #ffd090 50%, transparent 70%)',
              boxShadow: '0 0 8px 2px rgba(255,200,120,0.4)',
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Ambient light effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Warm fireplace glow */}
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-gradient-to-tr from-[#ff6020]/8 via-[#ff8040]/4 to-transparent blur-2xl animate-fire-glow" />
        
        {/* Cool window light */}
        <div className="absolute top-0 right-0 w-[50%] h-[60%] bg-gradient-to-bl from-[#405060]/6 via-[#304050]/3 to-transparent blur-xl" />
        
        {/* Candle glow accumulation */}
        <div className="absolute bottom-[5%] right-[15%] w-40 h-40 bg-[#ff9040]/8 rounded-full blur-3xl" />
        
        {/* Cozy vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,8,6,0.4)_70%,rgba(10,8,6,0.7)_100%)]" />
      </div>

      {/* Floating dust particles in light */}
      {[...Array(20)].map((_, i) => (
        <div
          key={`dust-${i}`}
          className="absolute w-0.5 h-0.5 bg-[#ffd8a0]/25 rounded-full animate-float"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 60}%`,
            animationDelay: `${i * 0.4}s`,
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
          className="absolute bottom-[18%] left-[45%]"
          ariaLabel="Bed - Opens Rest and Grounding tools"
        />
        
        {/* Fireplace hotspot */}
        <RoomHotspot
          id="fireplace"
          label="Comfort & Soothing"
          onClick={() => onHotspotClick('fireplace')}
          isHighlighted={highlightedHotspot === 'fireplace'}
          isActive={activeHotspot === 'fireplace'}
          className="absolute bottom-[25%] left-[10%]"
          ariaLabel="Fireplace - Opens Comfort and Soothing tools"
        />
        
        {/* Bookshelf hotspot */}
        <RoomHotspot
          id="bookshelf"
          label="Resources & Learning"
          onClick={() => onHotspotClick('bookshelf')}
          isHighlighted={highlightedHotspot === 'bookshelf'}
          isActive={activeHotspot === 'bookshelf'}
          className="absolute top-[35%] left-[8%]"
          ariaLabel="Bookshelf - Opens Resources and Learning"
        />
        
        {/* Lamp hotspot */}
        <RoomHotspot
          id="lamp"
          label="Calm Settings"
          onClick={() => onHotspotClick('lamp')}
          isHighlighted={highlightedHotspot === 'lamp'}
          isActive={activeHotspot === 'lamp'}
          className="absolute top-[35%] left-[18%]"
          ariaLabel="Lamp - Opens Calm Settings panel"
        />
        
        {/* Nightstand hotspot */}
        <RoomHotspot
          id="nightstand"
          label="Today Check-In"
          onClick={() => onHotspotClick('nightstand')}
          isHighlighted={highlightedHotspot === 'nightstand'}
          isActive={activeHotspot === 'nightstand'}
          className="absolute bottom-[22%] left-[25%]"
          ariaLabel="Nightstand - Opens Today Check-In"
        />
        
        {/* Rug hotspot */}
        <RoomHotspot
          id="rug"
          label="Grounding Tools"
          onClick={() => onHotspotClick('rug')}
          isHighlighted={highlightedHotspot === 'rug'}
          isActive={activeHotspot === 'rug'}
          className="absolute bottom-[8%] left-[48%]"
          ariaLabel="Rug - Opens Grounding Tools"
        />
        
        {/* Window hotspot */}
        <RoomHotspot
          id="window"
          label="Look Outside"
          onClick={() => onHotspotClick('window')}
          isHighlighted={highlightedHotspot === 'window'}
          isActive={activeHotspot === 'window'}
          className="absolute top-[28%] right-[25%]"
          ariaLabel="Window - Opens Look Outside for visual grounding"
        />
        
        {/* Wall Art hotspot */}
        <RoomHotspot
          id="wall-art"
          label="Emotions & Thoughts"
          onClick={() => onHotspotClick('wall-art')}
          isHighlighted={highlightedHotspot === 'wall-art'}
          isActive={activeHotspot === 'wall-art'}
          className="absolute top-[22%] left-[42%]"
          ariaLabel="Wall Art - Opens Emotions and Thoughts panel"
        />
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes rain {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(350%); opacity: 0; }
        }
        .animate-rain {
          animation: rain linear infinite;
        }
        
        @keyframes fire-1 {
          0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.9; }
          50% { transform: scaleY(1.15) scaleX(0.95); opacity: 1; }
        }
        @keyframes fire-2 {
          0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.85; }
          33% { transform: scaleY(1.2) scaleX(0.9); opacity: 1; }
          66% { transform: scaleY(0.95) scaleX(1.05); opacity: 0.9; }
        }
        @keyframes fire-3 {
          0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.9; }
          40% { transform: scaleY(1.1) scaleX(0.92); opacity: 1; }
        }
        .animate-fire-1 { animation: fire-1 0.8s ease-in-out infinite; }
        .animate-fire-2 { animation: fire-2 1s ease-in-out infinite; }
        .animate-fire-3 { animation: fire-3 0.9s ease-in-out infinite; }
        
        @keyframes fire-glow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        .animate-fire-glow { animation: fire-glow 2s ease-in-out infinite; }
        
        @keyframes ember {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        .animate-ember { animation: ember 1.5s ease-in-out infinite; }
        
        @keyframes candle {
          0%, 100% { transform: scaleY(1) translateX(-50%); }
          25% { transform: scaleY(1.1) translateX(-45%); }
          50% { transform: scaleY(0.95) translateX(-55%); }
          75% { transform: scaleY(1.05) translateX(-48%); }
        }
        .animate-candle { animation: candle 2s ease-in-out infinite; }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};
