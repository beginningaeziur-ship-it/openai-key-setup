import { cn } from '@/lib/utils';

export type SceneType = 
  | 'bedroom' 
  | 'cabin' 
  | 'ocean' 
  | 'woods';

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
  cabin: {
    gradient: 'from-[#2d1b0e] via-[#1a1208] to-[#0d0906]',
    particles: true,
  },
  ocean: {
    gradient: 'from-[#0a3d62] via-[#1e5f74] to-[#0a2647]',
    particles: true,
  },
  woods: {
    gradient: 'from-[#1f3b2f] via-[#162821] to-[#0d1a14]',
    particles: true,
  },
};

export function SceneBackground({ scene, className, children }: SceneBackgroundProps) {
  const config = sceneStyles[scene] || sceneStyles.bedroom;

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
  { id: 'cabin' as SceneType, label: 'Cabin Fireplace', icon: '🔥', description: 'Warm and grounding' },
  { id: 'ocean' as SceneType, label: 'Ocean', icon: '🌊', description: 'Calm and rhythmic' },
  { id: 'woods' as SceneType, label: 'Woods / River', icon: '🌲', description: 'Still and grounding' },
];
