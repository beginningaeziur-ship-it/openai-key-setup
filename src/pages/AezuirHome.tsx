import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SAICharacter } from '@/components/aezuir/SAICharacter';
import { PanicButton } from '@/components/aezuir/PanicButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSAI } from '@/contexts/SAIContext';
import { useSAIDailyEngine } from '@/contexts/SAIDailyEngineContext';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import {
  Moon,
  Waves,
  Trees,
  Tent,
  Sun,
  MessageCircle,
} from 'lucide-react';

/**
 * AezuirHome — Main home screen with SAI and four room navigation.
 *
 * Four Rooms:
 *  1. Bedroom — morning check-ins, daily goals
 *  2. Beach/Ocean — grounding tools, breathing
 *  3. Log Cabin/Forest — learning, nine-step program, advocacy
 *  4. Camping/Cabin — settings
 *
 * Accessibility first — designed for Zima (blind, ADHD, PTSD):
 *  - All interactive elements have aria-labels
 *  - High-contrast text on card backgrounds
 *  - Large touch targets (min 56px)
 *  - Semantic landmarks (header, main, nav)
 *  - Skip-to-content link
 */

interface RoomCard {
  id: string;
  label: string;
  subtitle: string;
  route: string;
  Icon: React.ElementType;
  /** Tailwind gradient for the card background */
  gradient: string;
  /** Tailwind color for the icon */
  iconColor: string;
  ariaLabel: string;
}

const ROOMS: RoomCard[] = [
  {
    id: 'bedroom',
    label: 'Bedroom',
    subtitle: 'Morning check-ins & daily goals',
    route: '/sai-home',
    Icon: Moon,
    gradient: 'from-indigo-900/90 to-purple-900/80',
    iconColor: 'text-indigo-300',
    ariaLabel: 'Go to Bedroom — morning check-ins and daily goals',
  },
  {
    id: 'beach',
    label: 'Beach',
    subtitle: 'Grounding tools & breathing',
    route: '/beach',
    Icon: Waves,
    gradient: 'from-cyan-900/90 to-teal-900/80',
    iconColor: 'text-cyan-300',
    ariaLabel: 'Go to Beach — grounding tools and breathing exercises',
  },
  {
    id: 'forest',
    label: 'Forest',
    subtitle: 'Learning & nine-step program',
    route: '/forest',
    Icon: Trees,
    gradient: 'from-green-900/90 to-emerald-900/80',
    iconColor: 'text-green-300',
    ariaLabel: 'Go to Forest — learning, nine-step program, and advocacy',
  },
  {
    id: 'cabin',
    label: 'Cabin',
    subtitle: 'Settings & privacy',
    route: '/settings',
    Icon: Tent,
    gradient: 'from-amber-900/90 to-orange-900/80',
    iconColor: 'text-amber-300',
    ariaLabel: 'Go to Cabin — settings and privacy options',
  },
];

export default function AezuirHome() {
  const navigate = useNavigate();
  const { userProfile } = useSAI();
  const { isSpeaking } = useVoiceSettings();
  const { needsMorningCheckIn, needsEveningCheckIn } = useSAIDailyEngine();

  const userName = userProfile?.nickname || 'Friend';

  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 20;

  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const saiState = isSpeaking
    ? 'speaking'
    : needsMorningCheckIn
    ? 'attentive'
    : 'happy';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDay ? (
              <Sun className="w-5 h-5 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-400" aria-hidden="true" />
            )}
            <span className="font-semibold text-white text-lg">Aezuir</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/chat')}
            className="text-white/70 hover:text-white gap-2"
            aria-label="Open chat with SAI"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Talk to SAI</span>
          </Button>
        </div>
      </header>

      {/* Main */}
      <main id="main-content" className="flex-1 flex flex-col items-center px-4 py-6 max-w-lg mx-auto w-full">
        {/* Greeting */}
        <section aria-label="Greeting" className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">
            {greeting}, {userName}
          </h1>
          <p className="text-white/60 text-sm">
            {needsMorningCheckIn
              ? "SAI has your morning check-in ready."
              : needsEveningCheckIn
              ? "Time for your evening reflection."
              : "Your safe space is here."}
          </p>
        </section>

        {/* SAI Character */}
        <section aria-label="SAI the service dog" className="mb-8">
          <SAICharacter
            state={saiState}
            size="lg"
            showBreathing
            aria-label={`SAI the Dalmatian robot service dog — ${saiState}`}
          />
          {(needsMorningCheckIn || needsEveningCheckIn) && (
            <p
              role="status"
              aria-live="polite"
              className="text-center text-amber-300 text-sm mt-2 font-medium"
            >
              {needsMorningCheckIn
                ? "Morning check-in available in Bedroom"
                : "Evening check-in available in Bedroom"}
            </p>
          )}
        </section>

        {/* Room Navigation */}
        <nav aria-label="Room navigation" className="w-full">
          <h2 className="sr-only">Choose a room</h2>
          <div className="grid grid-cols-2 gap-3">
            {ROOMS.map((room) => {
              const Icon = room.Icon;
              const hasBadge =
                (room.id === 'bedroom' && (needsMorningCheckIn || needsEveningCheckIn));

              return (
                <Card
                  key={room.id}
                  className={cn(
                    'relative overflow-hidden border-0 cursor-pointer',
                    'transition-transform duration-150 active:scale-95',
                    'focus-within:ring-2 focus-within:ring-white/50 focus-within:ring-offset-2 focus-within:ring-offset-slate-900'
                  )}
                  onClick={() => navigate(room.route)}
                >
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br',
                      room.gradient
                    )}
                    aria-hidden="true"
                  />
                  <CardContent className="relative p-5">
                    <button
                      onClick={() => navigate(room.route)}
                      aria-label={room.ariaLabel}
                      className="w-full text-left focus:outline-none"
                      tabIndex={0}
                    >
                      <Icon
                        className={cn('w-8 h-8 mb-3', room.iconColor)}
                        aria-hidden="true"
                      />
                      <p className="font-bold text-white text-base leading-tight mb-0.5">
                        {room.label}
                      </p>
                      <p className="text-white/60 text-xs leading-snug">
                        {room.subtitle}
                      </p>
                    </button>

                    {/* Notification badge */}
                    {hasBadge && (
                      <span
                        aria-label="Check-in available"
                        className="absolute top-3 right-3 w-3 h-3 rounded-full bg-amber-400 animate-pulse"
                      />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </nav>

        {/* Mission tagline */}
        <p className="text-white/30 text-xs text-center mt-8 max-w-xs">
          Filling the gap between crisis and professional help — with SAI.
        </p>
      </main>

      {/* Panic button — floating, always accessible */}
      <PanicButton variant="floating" />
    </div>
  );
}
