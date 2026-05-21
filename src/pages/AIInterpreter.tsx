import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Accessibility } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AIInterpreterPanel } from '@/components/interpreter/AIInterpreterPanel';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';

const AIInterpreter = () => {
  const navigate = useNavigate();
  const { speak, voiceEnabled } = useVoiceSettings();

  const speakFn = voiceEnabled ? speak : undefined;

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      role="main"
      aria-label="AI Interpreter"
    >
      {/* Skip link for keyboard users */}
      <a
        href="#interpreter-panel"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to interpreter
      </a>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto w-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="h-9 w-9"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Accessibility className="w-5 h-5 text-primary" aria-hidden />
            <h1 className="font-semibold text-foreground">AI Interpreter</h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-4 py-6 gap-6 max-w-2xl mx-auto w-full">
        {/* Introduction for screen readers */}
        <div className="sr-only" aria-live="polite">
          AI Interpreter active. Voice-powered accessibility assistant.
          Say "activate Aria" to start, or use the power button.
        </div>

        {/* Interpreter panel */}
        <div id="interpreter-panel" className="w-full">
          <AIInterpreterPanel speakFn={speakFn} />
        </div>

        {/* Capability cards */}
        <section aria-label="Capabilities" className="w-full space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground px-1">What I can do</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CAPABILITIES.map(cap => (
              <div
                key={cap.title}
                className="p-4 rounded-xl border border-border bg-card space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden>{cap.emoji}</span>
                  <h3 className="text-sm font-medium">{cap.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{cap.description}</p>
                <p className="text-xs text-primary/80 font-mono mt-1">"{cap.example}"</p>
              </div>
            ))}
          </div>
        </section>

        {/* Keyboard shortcuts */}
        <section aria-label="Voice command tips" className="w-full">
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
            <h2 className="text-sm font-medium">Voice command tips</h2>
            <ul className="space-y-1.5 text-xs text-muted-foreground" role="list">
              {TIPS.map(tip => (
                <li key={tip} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5" aria-hidden>›</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
};

const CAPABILITIES = [
  {
    emoji: '👁️',
    title: 'Screen Reading',
    description: 'Reads page content, headings, buttons, and form fields aloud.',
    example: 'Read the screen',
  },
  {
    emoji: '🖱️',
    title: 'UI Automation',
    description: 'Clicks buttons, fills forms, selects options, and scrolls pages.',
    example: 'Click the submit button',
  },
  {
    emoji: '🛒',
    title: 'Shopping',
    description: 'Identifies products, reads prices, colors, expiration dates, and automates checkout.',
    example: 'What product is this?',
  },
  {
    emoji: '📞',
    title: 'Calls & Messaging',
    description: 'Makes calls, navigates phone menus, and sends messages hands-free.',
    example: 'Call Mom',
  },
  {
    emoji: '🧠',
    title: 'Multi-AI',
    description: 'Powered by Claude, ChatGPT, and Google Gemini — automatically uses the best AI for each task.',
    example: 'Use Claude',
  },
  {
    emoji: '🗺️',
    title: 'Navigation',
    description: 'Opens apps, navigates pages, lists links, and manages focus.',
    example: 'Go to settings',
  },
];

const TIPS = [
  'Speak naturally — commands don\'t need to be exact.',
  'Say "read the screen" at any time to hear what\'s on screen.',
  'Say "repeat" to hear the last response again.',
  'Say "stop" to deactivate, "activate Aria" to restart.',
  'Switch AI: "Use Claude" / "Use ChatGPT" / "Use Google".',
  'Type commands if voice isn\'t working using the keyboard button.',
];

export default AIInterpreter;
