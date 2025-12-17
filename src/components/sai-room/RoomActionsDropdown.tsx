import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Menu, 
  Wind, 
  Target, 
  BookOpen, 
  Settings, 
  Heart,
  Sun,
  Waves,
  Mountain,
  TreePine,
  Moon,
  Flame,
  Snowflake,
  Tent,
  Cloud
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SceneType } from './SceneBackground';

interface RoomAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

interface RoomActionsDropdownProps {
  scene: SceneType;
  onActionSelect: (actionId: string) => void;
  className?: string;
}

// Scene-specific actions with appropriate metaphors
const sceneActions: Record<SceneType, RoomAction[]> = {
  bedroom: [
    { id: 'grounding', label: 'Rug', description: 'Soft grounding exercises', icon: Wind },
    { id: 'comfort', label: 'Fireplace', description: 'Warmth & emotional soothing', icon: Flame },
    { id: 'rest', label: 'Bed', description: 'Rest & breathing space', icon: Heart },
    { id: 'research', label: 'Bookshelf', description: 'Scripts & resources', icon: BookOpen },
    { id: 'tools', label: 'Coffee Table', description: 'Daily tasks & goals', icon: Target },
    { id: 'settings', label: 'Lamp', description: 'Voice & settings', icon: Settings },
  ],
  ocean: [
    { id: 'grounding', label: 'Sun', description: 'Warm light grounding', icon: Sun },
    { id: 'comfort', label: 'Waves', description: 'Rhythmic calm & soothing', icon: Waves },
    { id: 'rest', label: 'Shore', description: 'Rest on soft sand', icon: Heart },
    { id: 'research', label: 'Horizon', description: 'Perspective & clarity', icon: BookOpen },
    { id: 'tools', label: 'Tide Pools', description: 'Daily reflections', icon: Target },
    { id: 'settings', label: 'Sunset', description: 'Adjust your view', icon: Settings },
  ],
  cabin: [
    { id: 'grounding', label: 'Snow View', description: 'Cool, calm presence', icon: Snowflake },
    { id: 'comfort', label: 'Hearth Fire', description: 'Crackling warmth & peace', icon: Flame },
    { id: 'rest', label: 'Cozy Couch', description: 'Sink into safety', icon: Heart },
    { id: 'research', label: 'Cabin Shelf', description: 'Wisdom & guides', icon: BookOpen },
    { id: 'tools', label: 'Writing Desk', description: 'Plan & organize', icon: Target },
    { id: 'settings', label: 'Lantern', description: 'Light & settings', icon: Settings },
  ],
  woods: [
    { id: 'grounding', label: 'Forest Floor', description: 'Earth beneath your feet', icon: TreePine },
    { id: 'comfort', label: 'Campfire', description: 'Glowing embers & calm', icon: Flame },
    { id: 'rest', label: 'Tent', description: 'Shelter & peaceful sleep', icon: Tent },
    { id: 'research', label: 'Mountain View', description: 'Broader perspective', icon: Mountain },
    { id: 'tools', label: 'Trail Marker', description: 'Track your path', icon: Target },
    { id: 'settings', label: 'Moon', description: 'Night mode & settings', icon: Moon },
  ],
};

export const RoomActionsDropdown: React.FC<RoomActionsDropdownProps> = ({
  scene,
  onActionSelect,
  className,
}) => {
  const actions = sceneActions[scene] || sceneActions.bedroom;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className={cn(
            "h-12 px-6 rounded-2xl",
            "bg-card/60 backdrop-blur-md border-border/40",
            "hover:bg-card/80 hover:border-primary/40",
            "shadow-lg shadow-black/10",
            className
          )}
        >
          <Menu className="w-5 h-5 mr-2" />
          Explore Room
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="center" 
        className="w-64 bg-card/95 backdrop-blur-xl border-border/50"
      >
        {actions.map((action, index) => (
          <React.Fragment key={action.id}>
            <DropdownMenuItem
              onClick={() => onActionSelect(action.id)}
              className="flex items-start gap-3 p-3 cursor-pointer focus:bg-primary/10"
            >
              <action.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{action.label}</span>
                <span className="text-xs text-muted-foreground">{action.description}</span>
              </div>
            </DropdownMenuItem>
            {index < actions.length - 1 && <DropdownMenuSeparator className="bg-border/30" />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
