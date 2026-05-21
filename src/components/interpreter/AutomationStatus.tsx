import { ShoppingCart, Phone, Navigation, Monitor, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const WORKFLOW_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  'screen-reader':      { label: 'Reading screen',    icon: <Monitor className="w-4 h-4" />,      color: 'text-blue-500' },
  'visual-description': { label: 'Describing visuals', icon: <Monitor className="w-4 h-4" />,      color: 'text-blue-400' },
  'ui-automation':      { label: 'Automating UI',     icon: <Navigation className="w-4 h-4" />,   color: 'text-yellow-500' },
  'form-filling':       { label: 'Filling form',      icon: <Navigation className="w-4 h-4" />,   color: 'text-yellow-400' },
  'navigation':         { label: 'Navigating',        icon: <Navigation className="w-4 h-4" />,   color: 'text-green-500' },
  'search':             { label: 'Searching',         icon: <Monitor className="w-4 h-4" />,      color: 'text-green-400' },
  'shopping':           { label: 'Shopping',          icon: <ShoppingCart className="w-4 h-4" />, color: 'text-pink-500' },
  'checkout':           { label: 'Checking out',      icon: <ShoppingCart className="w-4 h-4" />, color: 'text-pink-400' },
  'calling':            { label: 'Calling',           icon: <Phone className="w-4 h-4" />,        color: 'text-teal-500' },
  'messaging':          { label: 'Messaging',         icon: <Phone className="w-4 h-4" />,        color: 'text-teal-400' },
  'conversation':       { label: 'Thinking',          icon: <Loader2 className="w-4 h-4 animate-spin" />, color: 'text-purple-500' },
};

interface AutomationStatusProps {
  workflow: string | null;
  isProcessing: boolean;
  lastResponse: string | null;
}

export function AutomationStatus({ workflow, isProcessing, lastResponse }: AutomationStatusProps) {
  const meta = workflow ? WORKFLOW_META[workflow] : null;

  return (
    <div className="space-y-3">
      {/* Workflow badge */}
      {isProcessing && meta && (
        <div
          className={cn('flex items-center gap-2 text-sm font-medium', meta.color)}
          role="status"
          aria-live="polite"
        >
          <span aria-hidden>{meta.icon}</span>
          <span>{meta.label}...</span>
        </div>
      )}

      {/* Last response */}
      {lastResponse && !isProcessing && (
        <div
          className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/50"
          aria-live="polite"
          aria-label="AI response"
        >
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" aria-hidden />
          <p className="text-sm text-foreground leading-relaxed">{lastResponse}</p>
        </div>
      )}
    </div>
  );
}
