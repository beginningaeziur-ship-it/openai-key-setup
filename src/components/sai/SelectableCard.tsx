import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface SelectableCardProps {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  selected: boolean;
  onSelect: (id: string) => void;
  className?: string;
}

export function SelectableCard({ 
  id, 
  label, 
  description, 
  icon, 
  selected, 
  onSelect,
  className 
}: SelectableCardProps) {
  return (
    <button
      onClick={() => onSelect(id)}
      className={cn(
        "relative w-full p-4 rounded-xl border-2 transition-all duration-200 text-left",
        "hover:border-primary/50 hover:bg-primary/5",
        "focus:outline-none focus:ring-2 focus:ring-primary/30",
        selected 
          ? "border-primary bg-primary/10" 
          : "border-border bg-card",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <span className="text-2xl flex-shrink-0">{icon}</span>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground">{label}</p>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
          selected 
            ? "border-primary bg-primary" 
            : "border-muted-foreground/30"
        )}>
          {selected && <Check className="w-4 h-4 text-primary-foreground" />}
        </div>
      </div>
    </button>
  );
}
