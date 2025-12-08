import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface RoomAreaProps {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  iconBgColor?: string;
  onClick: () => void;
  isActive?: boolean;
  className?: string;
}

export function RoomArea({
  id,
  label,
  description,
  icon: Icon,
  iconBgColor = 'bg-primary/20',
  onClick,
  isActive,
  className,
}: RoomAreaProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex flex-col items-center text-center p-4 rounded-2xl',
        'bg-card/40 backdrop-blur-sm border border-border/30',
        'transition-all duration-300 hover:scale-105 hover:bg-card/60',
        'hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10',
        isActive && 'border-primary/60 bg-card/70 scale-105 shadow-lg shadow-primary/20',
        className
      )}
    >
      {/* Glow effect on hover */}
      <div className={cn(
        'absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300',
        'bg-gradient-to-t from-primary/10 to-transparent',
        'group-hover:opacity-100',
        isActive && 'opacity-100'
      )} />

      {/* Icon */}
      <div className={cn(
        'relative w-14 h-14 rounded-xl flex items-center justify-center mb-3',
        'transition-all duration-300 group-hover:scale-110',
        iconBgColor,
        isActive && 'scale-110'
      )}>
        <Icon className={cn(
          'w-7 h-7 transition-colors duration-300',
          isActive ? 'text-primary' : 'text-foreground/80 group-hover:text-primary'
        )} />
      </div>

      {/* Label */}
      <span className={cn(
        'relative font-medium text-sm transition-colors duration-300',
        isActive ? 'text-primary' : 'text-foreground/90 group-hover:text-foreground'
      )}>
        {label}
      </span>

      {/* Description */}
      <span className="relative text-xs text-muted-foreground mt-1 leading-tight">
        {description}
      </span>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full" />
      )}
    </button>
  );
}
