import { cn } from '@/lib/utils';

export type SceneType = 
  | 'bedroom' 
  | 'living_room' 
  | 'forest_cabin' 
  | 'mountain' 
  | 'ocean' 
  | 'quiet_woods' 
  | 'dim_room';

interface SceneBackgroundProps {
  scene: SceneType;
  className?: string;
  children?: React.ReactNode;
}

const sceneStyles: Record<SceneType, { gradient: string; particles?: boolean }> = {
  bedroom: {
    gradient: 'from-[#1a1a2e] via-[#16213e] to-[#0f0f23]',
    particles: true,
  },
  living_room: {
    gradient: 'from-[#2d1b0e] via-[#1a1208] to-[#0d0906]',
    particles: true,
  },
  forest_cabin: {
    gradient: 'from-[#1a2f1a] via-[#0f1f0f] to-[#0a150a]',
    particles: true,
  },
  mountain: {
    gradient: 'from-[#1e3a5f] via-[#0f2847] to-[#0a1628]',
  },
  ocean: {
    gradient: 'from-[#0a3d62] via-[#1e5f74] to-[#0a2647]',
    particles: true,
  },
  quiet_woods: {
    gradient: 'from-[#1f3b2f] via-[#162821] to-[#0d1a14]',
    particles: true,
  },
  dim_room: {
    gradient: 'from-[#1a1a1a] via-[#121212] to-[#0a0a0a]',
  },
};

export function SceneBackground({ scene, className, children }: SceneBackgroundProps) {
  const config = sceneStyles[scene];

  return (
    <div className={cn('relative min-h-screen overflow-hidden', className)}>
      {/* Base gradient */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-b transition-all duration-1000',
        config.gradient
      )} />
      
      {/* Ambient particles/fireflies for certain scenes */}
      {config.particles && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${4 + i * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Subtle glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export const sceneOptions = [
  { id: 'bedroom' as SceneType, label: 'Bedroom Sanctuary', icon: '🛏️', description: 'Cozy and safe' },
  { id: 'living_room' as SceneType, label: 'Living Room with Fireplace', icon: '🔥', description: 'Warm and grounding' },
  { id: 'forest_cabin' as SceneType, label: 'Forest Cabin', icon: '🏕️', description: 'Nature and peace' },
  { id: 'mountain' as SceneType, label: 'Mountain View', icon: '🏔️', description: 'Open and expansive' },
  { id: 'ocean' as SceneType, label: 'Ocean Waves', icon: '🌊', description: 'Calm and rhythmic' },
  { id: 'quiet_woods' as SceneType, label: 'Quiet Woods', icon: '🌲', description: 'Still and grounding' },
  { id: 'dim_room' as SceneType, label: 'Soft Dim-lit Room', icon: '🌙', description: 'Minimal sensory input' },
];
