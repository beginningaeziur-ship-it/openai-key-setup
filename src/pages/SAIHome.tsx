import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StateIndicator } from "@/engine/StateIndicator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/**
 * SAIHome — Safe, accessible home screen.
 * Dark background, teal accent, high-contrast white text.
 * Persistent SOS at bottom center. Dev-only debug lives in App.tsx.
 */

const BG = "#0A1628";
const ACCENT = "#028090";

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 22) return "Good evening";
  return "You're up late.";
}

interface Room {
  id: string;
  emoji: string;
  label: string;
  sub: string;
  route: string;
}

const ROOMS: Room[] = [
  { id: "bedroom", emoji: "🛏️", label: "Bedroom", sub: "Daily grounding", route: "/bedroom" },
  { id: "ocean", emoji: "🌊", label: "Ocean", sub: "Calm & regulate", route: "/beach" },
  { id: "forest", emoji: "🌲", label: "Forest", sub: "Goals & learning", route: "/forest" },
  { id: "cabin", emoji: "🏡", label: "Cabin", sub: "Settings", route: "/settings" },
];

export default function SAIHome() {
  const navigate = useNavigate();
  const [sosOpen, setSosOpen] = useState(false);

  return (
    <div
      className="min-h-dvh flex flex-col text-white"
      style={{ backgroundColor: BG }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-sm font-medium text-white/70">SAI</span>
        <StateIndicator />
      </header>

      <main className="flex-1 flex flex-col px-5 pt-8 pb-40 max-w-xl w-full mx-auto">
        {/* Greeting */}
        <section aria-labelledby="sai-greeting" className="mb-10">
          <h1
            id="sai-greeting"
            className="text-4xl sm:text-5xl font-semibold tracking-tight"
          >
            Hey. SAI is here.
          </h1>
          <p className="mt-3 text-lg text-white/70">{getTimeGreeting()}</p>
        </section>

        {/* Rooms */}
        <nav aria-label="Rooms" className="flex flex-col gap-3">
          {ROOMS.map((room) => (
            <button
              key={room.id}
              type="button"
              role="button"
              aria-label={`${room.label} — ${room.sub}`}
              onClick={() => navigate(room.route)}
              className="min-h-[72px] w-full flex items-center gap-4 px-5 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1628] transition-colors text-left"
              style={{ ["--tw-ring-color" as string]: ACCENT }}
            >
              <span aria-hidden="true" className="text-3xl">
                {room.emoji}
              </span>
              <span className="flex flex-col">
                <span className="text-lg font-medium">{room.label}</span>
                <span className="text-sm text-white/60">{room.sub}</span>
              </span>
            </button>
          ))}
        </nav>
      </main>

      {/* SOS — always visible */}
      <div className="fixed bottom-0 inset-x-0 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3 px-4 flex justify-center pointer-events-none z-50">
        <button
          type="button"
          aria-label="SOS — get immediate help"
          onClick={() => setSosOpen(true)}
          className="pointer-events-auto min-h-[64px] px-10 rounded-full bg-red-600 hover:bg-red-700 text-white text-xl font-bold shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
        >
          SOS
        </button>
      </div>

      <Dialog open={sosOpen} onOpenChange={setSosOpen}>
        <DialogContent className="bg-[#0A1628] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">You're not alone.</DialogTitle>
            <DialogDescription className="text-white/70">
              Choose one.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            <a
              href="tel:988"
              className="min-h-[64px] flex items-center justify-center rounded-2xl bg-red-600 hover:bg-red-700 text-white text-lg font-semibold px-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Call a crisis counselor at 988"
            >
              Talk to a crisis counselor (988)
            </a>
            <button
              type="button"
              onClick={() => {
                setSosOpen(false);
                navigate("/onboarding/safety-plan");
              }}
              className="min-h-[64px] rounded-2xl text-white text-lg font-semibold px-5 focus:outline-none focus-visible:ring-2"
              style={{ backgroundColor: ACCENT }}
              aria-label="Build an immediate safety plan"
            >
              Build an immediate safety plan
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
