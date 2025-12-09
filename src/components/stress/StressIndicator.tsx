import React from 'react';
import { cn } from '@/lib/utils';
import { StressLevel } from '@/lib/stressDetection';
import { Heart, Activity, AlertTriangle, Shield } from 'lucide-react';

interface StressIndicatorProps {
  level: StressLevel;
  score: number;
  trend?: 'improving' | 'stable' | 'worsening';
  showDetails?: boolean;
  className?: string;
}

const levelConfig: Record<StressLevel, {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  label: string;
  pulseSpeed: string;
}> = {
  calm: {
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    icon: <Heart className="w-4 h-4" />,
    label: 'Calm',
    pulseSpeed: 'animate-pulse',
  },
  mild: {
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    icon: <Activity className="w-4 h-4" />,
    label: 'Mild',
    pulseSpeed: '',
  },
  moderate: {
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
    icon: <Activity className="w-4 h-4" />,
    label: 'Moderate',
    pulseSpeed: '',
  },
  high: {
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    icon: <AlertTriangle className="w-4 h-4" />,
    label: 'Elevated',
    pulseSpeed: 'animate-pulse',
  },
  crisis: {
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    icon: <Shield className="w-4 h-4" />,
    label: 'Crisis',
    pulseSpeed: 'animate-ping',
  },
};

export const StressIndicator: React.FC<StressIndicatorProps> = ({
  level,
  score,
  trend,
  showDetails = false,
  className,
}) => {
  const config = levelConfig[level];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Pulsing indicator */}
      <div className={cn(
        'relative flex items-center justify-center w-8 h-8 rounded-full border',
        config.bgColor,
        config.borderColor,
      )}>
        <div className={cn(
          'absolute inset-0 rounded-full',
          config.bgColor,
          level !== 'calm' && level !== 'mild' && 'animate-ping opacity-50'
        )} />
        <span className={cn('relative', config.color)}>
          {config.icon}
        </span>
      </div>

      {showDetails && (
        <div className="flex flex-col">
          <span className={cn('text-xs font-medium', config.color)}>
            {config.label}
          </span>
          <div className="flex items-center gap-1">
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn('h-full rounded-full transition-all duration-500', config.bgColor.replace('/20', ''))}
                style={{ width: `${score}%` }}
              />
            </div>
            {trend && (
              <span className={cn(
                'text-[10px]',
                trend === 'improving' && 'text-emerald-400',
                trend === 'stable' && 'text-muted-foreground',
                trend === 'worsening' && 'text-orange-400',
              )}>
                {trend === 'improving' && '↓'}
                {trend === 'stable' && '→'}
                {trend === 'worsening' && '↑'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Compact version for header/minimal display
export const StressIndicatorCompact: React.FC<{
  level: StressLevel;
  className?: string;
}> = ({ level, className }) => {
  const config = levelConfig[level];

  return (
    <div 
      className={cn(
        'w-3 h-3 rounded-full border',
        config.bgColor,
        config.borderColor,
        level !== 'calm' && level !== 'mild' && 'animate-pulse',
        className
      )}
      title={`Stress level: ${config.label}`}
    />
  );
};
