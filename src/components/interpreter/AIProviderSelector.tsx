import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AIProvider } from '@/interpreter/types/interpreter.types';

const PROVIDERS: { id: AIProvider; label: string; description: string; color: string }[] = [
  { id: 'auto',   label: 'Auto',    description: 'Smart routing',    color: 'bg-purple-500' },
  { id: 'claude', label: 'Claude',  description: 'Anthropic',        color: 'bg-orange-500' },
  { id: 'openai', label: 'ChatGPT', description: 'OpenAI',           color: 'bg-green-500'  },
  { id: 'google', label: 'Gemini',  description: 'Google',           color: 'bg-blue-500'   },
];

interface AIProviderSelectorProps {
  current: AIProvider;
  onChange: (provider: AIProvider) => void;
}

export function AIProviderSelector({ current, onChange }: AIProviderSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Bot className="w-4 h-4" />
        <span>AI Provider</span>
      </div>
      <div
        className="grid grid-cols-2 gap-2"
        role="radiogroup"
        aria-label="Select AI provider"
      >
        {PROVIDERS.map(provider => (
          <button
            key={provider.id}
            role="radio"
            aria-checked={current === provider.id}
            onClick={() => onChange(provider.id)}
            className={cn(
              'flex items-center gap-2 p-3 rounded-lg border text-left transition-all min-h-[56px]',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              current === provider.id
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border bg-card hover:border-primary/50 text-muted-foreground'
            )}
          >
            <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', provider.color)} aria-hidden />
            <div className="min-w-0">
              <div className="text-sm font-medium leading-tight">{provider.label}</div>
              <div className="text-xs text-muted-foreground leading-tight">{provider.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
