import { cn } from '@/lib/utils';
import cozyBedroomBg from '@/assets/cozy-bedroom-bg.jpg';
import cozyCabinBg from '@/assets/cozy-cabin-bg.jpg';
import tropicalOceanBg from '@/assets/tropical-ocean-bg.jpg';
import forestWoodsBg from '@/assets/forest-woods-bg.jpg';

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

const sceneConfig: Record<SceneType, { image: string; overlay: string; alt: string }> = {
  bedroom: {
    image: cozyBedroomBg,
    overlay: 'from-black/40 via-black/20 to-black/40',
    alt: 'Cozy bedroom with fireplace',
  },
  cabin: {
    image: cozyCabinBg,
    overlay: 'from-amber-900/30 via-black/20 to-black/40',
    alt: 'Cozy log cabin with stone fireplace',
  },
  ocean: {
    image: tropicalOceanBg,
    overlay: 'from-cyan-900/20 via-transparent to-black/30',
    alt: 'Tropical beach at sunset',
  },
  woods: {
    image: forestWoodsBg,
    overlay: 'from-indigo-900/20 via-transparent to-black/40',
    alt: 'Forest campsite at dusk',
  },
};

export function SceneBackground({ scene, className, children }: SceneBackgroundProps) {
  const config = sceneConfig[scene] || sceneConfig.bedroom;

  return (
    <div className={cn('relative min-h-screen overflow-hidden', className)}>
      {/* Photo background - ALWAYS visible */}
      <img
        src={config.image}
        alt={config.alt}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Subtle overlay for readability */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-b pointer-events-none',
        config.overlay
      )} />
      
      {/* Ambient particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${4 + i * 0.5}s`,
            }}
          />
        ))}
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
