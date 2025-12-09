import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SceneType } from './SceneBackground';
import { Bed, Flame, Waves, TreePine, Check } from 'lucide-react';

interface SceneSelectorProps {
  saiName: string;
  onSelect: (scene: SceneType) => void;
}

interface SceneOption {
  id: SceneType;
  label: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  preview: string;
}

const sceneOptions: SceneOption[] = [
  {
    id: 'bedroom',
    label: 'Cozy Bedroom',
    description: 'Warm, safe, familiar — like a sanctuary',
    icon: <Bed className="w-6 h-6" />,
    gradient: 'from-indigo-900/40 via-purple-900/30 to-slate-900/40',
    preview: 'Soft bed, warm lamp, crackling fireplace, your personal notebook',
  },
  {
    id: 'cabin',
    label: 'Mountain Cabin',
    description: 'Rustic warmth with crackling fire',
    icon: <Flame className="w-6 h-6" />,
    gradient: 'from-amber-900/40 via-orange-900/30 to-stone-900/40',
    preview: 'Wooden beams, stone fireplace, wool blankets, nature views',
  },
  {
    id: 'ocean',
    label: 'Ocean Shore',
    description: 'Calm waves, rhythmic and grounding',
    icon: <Waves className="w-6 h-6" />,
    gradient: 'from-cyan-900/40 via-blue-900/30 to-slate-900/40',
    preview: 'Gentle waves, soft sand, driftwood, sea breeze',
  },
  {
    id: 'woods',
    label: 'Forest Clearing',
    description: 'Still, grounding, connected to earth',
    icon: <TreePine className="w-6 h-6" />,
    gradient: 'from-emerald-900/40 via-green-900/30 to-slate-900/40',
    preview: 'Tall trees, mossy rocks, babbling stream, birdsong',
  },
];

export const SceneSelector: React.FC<SceneSelectorProps> = ({
  saiName,
  onSelect,
}) => {
  const [selectedScene, setSelectedScene] = useState<SceneType | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleConfirm = () => {
    if (selectedScene) {
      onSelect(selectedScene);
    }
  };

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex flex-col items-center justify-center p-4",
      "bg-gradient-to-b from-[#0d0d1a] via-[#1a1a2e] to-[#0f0f1f]",
      "transition-opacity duration-700",
      isVisible ? "opacity-100" : "opacity-0"
    )}>
      {/* Header */}
      <div className={cn(
        "text-center mb-8",
        "transition-all duration-700 delay-200",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      )}>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Choose Your Space
        </h2>
        <p className="text-muted-foreground max-w-md">
          Where would you feel most at ease? Each room has the same tools — just a different atmosphere.
        </p>
      </div>

      {/* Scene Grid */}
      <div className={cn(
        "grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-8",
        "transition-all duration-700 delay-400",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        {sceneOptions.map((scene, index) => (
          <button
            key={scene.id}
            onClick={() => setSelectedScene(scene.id)}
            className={cn(
              "relative p-6 rounded-2xl border transition-all duration-300",
              "text-left group overflow-hidden",
              `bg-gradient-to-br ${scene.gradient}`,
              selectedScene === scene.id
                ? "border-primary ring-2 ring-primary/30 scale-[1.02]"
                : "border-white/10 hover:border-white/20 hover:scale-[1.01]"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Selection indicator */}
            {selectedScene === scene.id && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            )}

            {/* Icon */}
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
              "bg-white/10 backdrop-blur-sm",
              selectedScene === scene.id ? "text-primary" : "text-foreground/80"
            )}>
              {scene.icon}
            </div>

            {/* Content */}
            <h3 className="font-semibold text-foreground mb-1">{scene.label}</h3>
            <p className="text-sm text-foreground/70 mb-3">{scene.description}</p>
            <p className="text-xs text-foreground/50">{scene.preview}</p>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>

      {/* Confirm button */}
      <div className={cn(
        "transition-all duration-700 delay-600",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <Button
          onClick={handleConfirm}
          disabled={!selectedScene}
          size="lg"
          className={cn(
            "h-14 px-12 rounded-2xl text-lg shadow-lg",
            selectedScene ? "shadow-primary/20" : "opacity-50"
          )}
        >
          Enter {selectedScene ? sceneOptions.find(s => s.id === selectedScene)?.label : 'Room'}
        </Button>
      </div>

      {/* SAI message */}
      <p className={cn(
        "text-center text-sm text-muted-foreground mt-8 max-w-sm",
        "transition-opacity duration-1000 delay-800",
        isVisible ? "opacity-100" : "opacity-0"
      )}>
        "{saiName} will guide you through your new space. You can always change rooms later."
      </p>
    </div>
  );
};
