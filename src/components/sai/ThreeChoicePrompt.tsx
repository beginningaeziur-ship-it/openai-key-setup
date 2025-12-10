import { cn } from '@/lib/utils';
import { LucideIcon, Shield, Sparkles, Zap } from 'lucide-react';

export interface ThreeChoiceOption {
  id: 'gentle' | 'standard' | 'challenge';
  label: string;
  description: string;
  icon?: LucideIcon;
}

interface ThreeChoicePromptProps {
  prompt: string;
  subtext?: string;
  options: ThreeChoiceOption[];
  selected?: string;
  onSelect: (id: string) => void;
  variant?: 'default' | 'compact';
  className?: string;
}

const defaultIcons: Record<string, LucideIcon> = {
  gentle: Shield,
  standard: Sparkles,
  challenge: Zap,
};

const choiceStyles: Record<string, { border: string; bg: string; iconBg: string }> = {
  gentle: {
    border: 'border-sai-calm',
    bg: 'bg-sai-calm/10 hover:bg-sai-calm/20',
    iconBg: 'bg-sai-calm/30',
  },
  standard: {
    border: 'border-primary',
    bg: 'bg-primary/10 hover:bg-primary/20',
    iconBg: 'bg-primary/30',
  },
  challenge: {
    border: 'border-sai-warm-dark',
    bg: 'bg-sai-warm/30 hover:bg-sai-warm/40',
    iconBg: 'bg-sai-warm-dark/30',
  },
};

export function ThreeChoicePrompt({
  prompt,
  subtext,
  options,
  selected,
  onSelect,
  variant = 'default',
  className,
}: ThreeChoicePromptProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="text-center space-y-1">
        <h3 className="text-lg font-display font-semibold text-foreground">
          {prompt}
        </h3>
        {subtext && (
          <p className="text-sm text-muted-foreground">{subtext}</p>
        )}
      </div>

      <div className={cn(
        'grid gap-3',
        variant === 'compact' ? 'grid-cols-3' : 'grid-cols-1'
      )}>
        {options.map((option) => {
          const Icon = option.icon || defaultIcons[option.id];
          const styles = choiceStyles[option.id];
          const isSelected = selected === option.id;

          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={cn(
                'relative p-4 rounded-xl border-2 transition-all duration-200 text-left',
                'focus:outline-none focus:ring-2 focus:ring-primary/30',
                isSelected ? styles.border : 'border-border',
                isSelected ? styles.bg : 'bg-card hover:bg-muted/50',
                variant === 'compact' && 'flex flex-col items-center text-center'
              )}
            >
              <div className={cn(
                'flex gap-3',
                variant === 'compact' && 'flex-col items-center'
              )}>
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                  isSelected ? styles.iconBg : 'bg-muted'
                )}>
                  <Icon className={cn(
                    'w-5 h-5',
                    isSelected ? 'text-foreground' : 'text-muted-foreground'
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'font-medium',
                    isSelected ? 'text-foreground' : 'text-foreground/80'
                  )}>
                    {option.label}
                  </p>
                  {variant !== 'compact' && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className={cn(
                  'absolute top-2 right-2 w-3 h-3 rounded-full',
                  option.id === 'gentle' && 'bg-sai-calm',
                  option.id === 'standard' && 'bg-primary',
                  option.id === 'challenge' && 'bg-sai-warm-dark'
                )} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Preset configurations for common three-choice scenarios
export const threeChoicePresets = {
  pace: {
    prompt: 'How would you like to move through this?',
    options: [
      {
        id: 'gentle' as const,
        label: 'Go gentle',
        description: 'Take it slow with extra explanations and breaks',
      },
      {
        id: 'standard' as const,
        label: 'Normal pace',
        description: 'Balanced approach with clear guidance',
      },
      {
        id: 'challenge' as const,
        label: 'Move faster',
        description: 'Skip basics, get to the core quickly',
      },
    ],
  },
  intensity: {
    prompt: 'How intense should we go?',
    options: [
      {
        id: 'gentle' as const,
        label: 'Keep it light',
        description: 'Focus on surface-level, low-pressure topics',
      },
      {
        id: 'standard' as const,
        label: 'Go deeper',
        description: 'Explore meaningful topics at a comfortable depth',
      },
      {
        id: 'challenge' as const,
        label: 'Full depth',
        description: 'Dive into challenging, transformative work',
      },
    ],
  },
  support: {
    prompt: 'How should I support you?',
    options: [
      {
        id: 'gentle' as const,
        label: 'Soft & gentle',
        description: 'Warm, nurturing, lots of encouragement',
      },
      {
        id: 'standard' as const,
        label: 'Clear & balanced',
        description: 'Direct but kind, practical guidance',
      },
      {
        id: 'challenge' as const,
        label: 'Direct & honest',
        description: 'Straightforward, no sugarcoating',
      },
    ],
  },
  goalSize: {
    prompt: 'What size goals feel right?',
    options: [
      {
        id: 'gentle' as const,
        label: 'Tiny steps',
        description: 'Micro-goals that feel completely doable',
      },
      {
        id: 'standard' as const,
        label: 'Balanced goals',
        description: 'Meaningful progress without overwhelm',
      },
      {
        id: 'challenge' as const,
        label: 'Ambitious goals',
        description: 'Push yourself with bigger milestones',
      },
    ],
  },
  next: {
    prompt: 'What would you like to do?',
    options: [
      {
        id: 'gentle' as const,
        label: 'Take a break',
        description: 'Pause and come back when ready',
      },
      {
        id: 'standard' as const,
        label: 'Continue',
        description: 'Keep going at current pace',
      },
      {
        id: 'challenge' as const,
        label: 'Skip ahead',
        description: 'Move to the next section faster',
      },
    ],
  },
};
