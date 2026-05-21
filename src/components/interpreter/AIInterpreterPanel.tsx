import { useState, useCallback } from 'react';
import { Power, Volume2, VolumeX, Settings2, Keyboard, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAIInterpreter } from '@/interpreter/hooks/useAIInterpreter';
import { VoiceCommandDisplay } from './VoiceCommandDisplay';
import { AIProviderSelector } from './AIProviderSelector';
import { AutomationStatus } from './AutomationStatus';
import type { AIProvider } from '@/interpreter/types/interpreter.types';

const QUICK_COMMANDS = [
  { label: 'Read screen',  command: 'read the screen' },
  { label: 'List buttons', command: 'list all buttons' },
  { label: 'Scroll down',  command: 'scroll down' },
  { label: 'Go home',      command: 'go to home' },
  { label: 'Add to cart',  command: 'add to cart' },
  { label: 'Help',         command: 'help' },
];

interface AIInterpreterPanelProps {
  className?: string;
  speakFn?: (text: string) => Promise<void>;
}

export function AIInterpreterPanel({ className, speakFn }: AIInterpreterPanelProps) {
  const interpreter = useAIInterpreter({ speakFn });
  const [showSettings, setShowSettings] = useState(false);
  const [typedCommand, setTypedCommand] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);

  const handleSwitchAI = useCallback((provider: AIProvider) => {
    interpreter.switchAI(provider);
  }, [interpreter]);

  const handleQuickCommand = useCallback((command: string) => {
    interpreter.processCommand(command);
  }, [interpreter]);

  const handleKeyboardSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedCommand.trim()) return;
    await interpreter.processCommand(typedCommand.trim());
    setTypedCommand('');
  }, [typedCommand, interpreter]);

  const handleToggleMute = useCallback(() => {
    interpreter.updateConfig({ autoSpeak: !interpreter.config.autoSpeak });
  }, [interpreter]);

  return (
    <div
      className={cn(
        'flex flex-col gap-4 p-4 rounded-2xl border border-border bg-card shadow-lg',
        'max-w-md w-full',
        className
      )}
      role="region"
      aria-label="AI Interpreter"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-colors',
              interpreter.isActive ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'
            )}
            aria-hidden
          />
          <h2 className="font-semibold text-foreground">
            {interpreter.config.name}
          </h2>
          {interpreter.currentWorkflow && (
            <span className="text-xs text-muted-foreground">
              · {interpreter.currentWorkflow}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleMute}
            aria-label={interpreter.config.autoSpeak ? 'Mute voice' : 'Unmute voice'}
            className="h-8 w-8"
          >
            {interpreter.config.autoSpeak
              ? <Volume2 className="w-4 h-4" />
              : <VolumeX className="w-4 h-4 text-muted-foreground" />
            }
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(s => !s)}
            aria-label="Settings"
            aria-expanded={showSettings}
            className="h-8 w-8"
          >
            <Settings2 className="w-4 h-4" />
          </Button>
          <Button
            variant={interpreter.isActive ? 'destructive' : 'default'}
            size="icon"
            onClick={interpreter.toggle}
            aria-label={interpreter.isActive ? 'Deactivate interpreter' : 'Activate interpreter'}
            className="h-8 w-8"
          >
            <Power className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Voice display */}
      <VoiceCommandDisplay
        isListening={interpreter.isListening}
        isProcessing={interpreter.isProcessing}
        interimText={interpreter.interimText}
        lastCommand={interpreter.currentIntent?.rawText || null}
      />

      {/* Response / automation status */}
      <AutomationStatus
        workflow={interpreter.currentWorkflow}
        isProcessing={interpreter.isProcessing}
        lastResponse={interpreter.lastResponse}
      />

      {/* Error */}
      {interpreter.error && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
          role="alert"
          aria-live="assertive"
        >
          <RefreshCw className="w-4 h-4 flex-shrink-0" aria-hidden />
          <span>{interpreter.error}</span>
        </div>
      )}

      {/* Quick commands */}
      {interpreter.isActive && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Quick commands</p>
          <div className="grid grid-cols-3 gap-1.5">
            {QUICK_COMMANDS.map(({ label, command }) => (
              <button
                key={command}
                onClick={() => handleQuickCommand(command)}
                className={cn(
                  'text-xs px-2 py-2 rounded-lg border border-border bg-muted/30',
                  'hover:border-primary/50 hover:bg-primary/5 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
                  'text-center leading-tight min-h-[40px]'
                )}
                aria-label={`Quick command: ${label}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard input toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowKeyboard(s => !s)}
          className="text-xs text-muted-foreground gap-1.5"
          aria-expanded={showKeyboard}
          aria-label="Type a command instead of speaking"
        >
          <Keyboard className="w-3.5 h-3.5" />
          Type command
        </Button>
      </div>

      {/* Keyboard input */}
      {showKeyboard && (
        <form onSubmit={handleKeyboardSubmit} className="flex gap-2">
          <input
            type="text"
            value={typedCommand}
            onChange={e => setTypedCommand(e.target.value)}
            placeholder="Type a command..."
            aria-label="Type a command"
            className={cn(
              'flex-1 text-sm px-3 py-2 rounded-lg border border-border bg-background',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
              'placeholder:text-muted-foreground'
            )}
          />
          <Button type="submit" size="sm" disabled={!typedCommand.trim()}>
            Send
          </Button>
        </form>
      )}

      {/* Settings panel */}
      {showSettings && (
        <div className="border-t border-border pt-4 space-y-4">
          <AIProviderSelector
            current={interpreter.config.primaryAI}
            onChange={handleSwitchAI}
          />

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Interpreter name</p>
            <input
              type="text"
              defaultValue={interpreter.config.name}
              onBlur={e => interpreter.updateConfig({ name: e.target.value })}
              className={cn(
                'w-full text-sm px-3 py-2 rounded-lg border border-border bg-background',
                'focus:outline-none focus:ring-2 focus:ring-primary'
              )}
              aria-label="Interpreter name"
              placeholder="e.g. Aria"
            />
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm">Screen reader mode</span>
            <input
              type="checkbox"
              checked={interpreter.config.screenReaderMode}
              onChange={e => interpreter.updateConfig({ screenReaderMode: e.target.checked })}
              className="w-4 h-4 rounded accent-primary"
              aria-label="Screen reader mode"
            />
          </label>
        </div>
      )}
    </div>
  );
}
