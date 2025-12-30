import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { 
  Menu, 
  TreePine,
  Home,
  Waves,
  Settings,
  Wrench,
  BookOpen,
  Heart,
  Target,
  Sparkles,
  Wind,
  Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SceneType } from './SceneBackground';

interface RoomArea {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  scene: 'bedroom' | 'cabin' | 'beach' | 'forest';
}

interface RoomActionsDropdownProps {
  scene: SceneType;
  onActionSelect: (actionId: string) => void;
  className?: string;
}

// Main areas accessible from bedroom dropdown
const mainAreas: RoomArea[] = [
  { 
    id: 'forest-resources', 
    label: 'Forest', 
    description: 'Resources & 12-step programs', 
    icon: TreePine,
    scene: 'forest'
  },
  { 
    id: 'cabin-settings', 
    label: 'Cabin', 
    description: 'Settings & goal adjustments', 
    icon: Home,
    scene: 'cabin'
  },
  { 
    id: 'beach-tools', 
    label: 'Beach', 
    description: 'Grounding, meditation & journal', 
    icon: Waves,
    scene: 'beach'
  },
];

// Bedroom-specific quick actions
const bedroomActions = [
  { id: 'grounding', label: 'Grounding', description: 'Quick calming exercises', icon: Wind },
  { id: 'comfort', label: 'Comfort', description: 'Warmth & emotional soothing', icon: Flame },
  { id: 'rest', label: 'Rest', description: 'Breathing & rest space', icon: Heart },
  { id: 'tools', label: 'Daily Tasks', description: 'Goals & to-do items', icon: Target },
];

export const RoomActionsDropdown: React.FC<RoomActionsDropdownProps> = ({
  scene,
  onActionSelect,
  className,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className={cn(
            "h-12 px-6 rounded-2xl",
            "bg-card/80 backdrop-blur-md border-border/40",
            "hover:bg-card hover:border-primary/40",
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
        sideOffset={8}
        className="w-72 bg-card border-border z-50"
      >
        {/* Main Areas - Navigate to different scenes */}
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
          Go To
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {mainAreas.map((area) => (
            <DropdownMenuItem
              key={area.id}
              onClick={() => onActionSelect(area.id)}
              className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted focus:bg-muted"
            >
              <area.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{area.label}</span>
                <span className="text-xs text-muted-foreground">{area.description}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="bg-border" />
        
        {/* Quick Bedroom Actions */}
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
          Quick Actions
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {bedroomActions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onClick={() => onActionSelect(action.id)}
              className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted focus:bg-muted"
            >
              <action.icon className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{action.label}</span>
                <span className="text-xs text-muted-foreground">{action.description}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="bg-border" />
        
        {/* Settings */}
        <DropdownMenuItem
          onClick={() => onActionSelect('settings')}
          className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted focus:bg-muted"
        >
          <Settings className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex flex-col">
            <span className="font-medium text-foreground">Settings</span>
            <span className="text-xs text-muted-foreground">Voice, appearance & preferences</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
