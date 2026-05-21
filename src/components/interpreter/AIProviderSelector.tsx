import { cn } from '@/lib/utils';
import type { AIProvider } from '@/interpreter/types/interpreter.types';

const PROVIDERS: {
  id: AIProvider;
  label: string;
  subtitle: string;
  personality: string;
  color: string;
  dot: string;
}[] = [
  {
    id: 'auto',
    label: 'Auto',
    subtitle: 'Smart routing',
    personality: 'Uses the best AI for each task automatically',
    color: 'border-purple-500/50 bg-purple-500/10',
    dot: 'bg-purple-500',
  },
  {
    id: 'claude',
    label: 'Claude',
    subtitle: 'by Anthropic',
    personality: 'Thoughtful, nuanced, great at describing things in detail',
    color: 'border-orange-500/50 bg-orange-500/10',
    dot: 'bg-orange-500',
  },
  {
    id: 'openai',
    label: 'ChatGPT',
    subtitle: 'by OpenAI',
    personality: 'Direct, efficient, great at tasks and structured work',
    color: 'border-green-500/50 bg-green-500/10',
    dot: 'bg-green-500',
  },
  {
    id: 'google',
    label: 'Gemini',
    subtitle: 'by Google',
    personality: 'Fast, conversational, great for quick answers',
    color: 'border-blue-500/50 bg-blue-500/10',
    dot: 'bg-blue-500',
  },
];

interface AIProviderSelectorProps {
  current: AIProvider;
  onChange: (provider: AIProvider) => void;
}

export function AIProviderSelector({ current, onChange }: AIProviderSelectorProps) {
  const currentProvider = PROVIDERS.find(p => p.id === current) || PROVIDERS[0];

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-sm font-medium">Which AI is your brain?</p>
        <p className="text-xs text-muted-foreground">
          This AI will power all of your conversations and narrate everything you hear.
        </p>
      </div>

      <div
        className="grid grid-cols-2 gap-2"
        role="radiogroup"
        aria-label="Choose your AI"
      >
        {PROVIDERS.map(provider => {
          const isSelected = current === provider.id;
          return (
            <button
              key={provider.id}
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(provider.id)}
              className={cn(
                'flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'min-h-[72px]',
                isSelected
                  ? `${provider.color} border-opacity-100`
                  : 'border-border/50 bg-card hover:border-primary/30'
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <div className={cn('w-2 h-2 rounded-full flex-shrink-0', provider.dot)} aria-hidden />
                <span className="text-sm font-semibold leading-none">{provider.label}</span>
                {isSelected && (
                  <span className="ml-auto text-xs font-medium text-primary">Active</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground leading-tight pl-4">
                {provider.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Show personality of current choice */}
      <p className="text-xs text-muted-foreground italic px-1">
        {currentProvider.personality}
      </p>
    </div>
  );
}
