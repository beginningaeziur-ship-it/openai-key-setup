import { useNavigate } from "react-router-dom";
import { StateIndicator } from "@/engine/StateIndicator";
import { SosButton } from "@/components/a11y/SosButton";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useGlobalA11yShortcuts } from "@/hooks/useGlobalA11yShortcuts";

/**
 * SAIHome — Safe, accessible home screen.
 * Dark background, teal accent, high-contrast white text.
 * SOS is rendered last so it is the final element in tab order.
 */

const BG = "#0A1628";
const ACCENT = "#028090";
const MUTED = "#B0BEC5";

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
  { id: "living-room", emoji: "🛋️", label: "Living Room", sub: "Vent, check in, and reset", route: "/living-room" },
  { id: "playroom", emoji: "🐕", label: "Playroom", sub: "Your companion and daily care", route: "/playroom" },
  { id: "tools", emoji: "🧰", label: "Tools Suite", sub: "Grounding and calming tools", route: "/tools" },
  { id: "advocacy", emoji: "📁", label: "Advocacy", sub: "Resources, documents, and help", route: "/advocacy" },
  { id: "settings", emoji: "⚙️", label: "Settings", sub: "Comfort, contrast, and privacy", route: "/settings" },
  { id: "bedroom", emoji: "🛏️", label: "Bedroom", sub: "Your private inner sanctum (PIN)", route: "/bedroom" },
];


export default function SAIHome() {
  const navigate = useNavigate();
  usePageTitle("SAI - Home");
  useGlobalA11yShortcuts();

  return (
    <div className="min-h-dvh flex flex-col text-white" style={{ backgroundColor: BG }}>
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/15">
        <span className="text-base font-medium" style={{ color: MUTED }}>
          SAI
        </span>
        <StateIndicator />
      </header>

      <main
        role="main"
        aria-label="SAI home"
        className="flex-1 flex flex-col px-5 pt-8 pb-40 max-w-xl w-full mx-auto"
      >
        <section aria-labelledby="sai-greeting" className="mb-10">
          <h1 id="sai-greeting" className="text-4xl sm:text-5xl font-semibold tracking-tight">
            Hey. SAI is here.
          </h1>
          <p className="mt-3 text-xl" style={{ color: MUTED }}>
            {getTimeGreeting()}
          </p>
          <button
            type="button"
            onClick={() => navigate("/chat")}
            aria-label="Talk to SAI"
            className="mt-6 min-h-[56px] w-full rounded-2xl text-white text-lg font-semibold px-5 focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
            style={{ backgroundColor: ACCENT }}
          >
            Talk to SAI
          </button>
        </section>

        <nav aria-label="Rooms" className="flex flex-col gap-3">
          {ROOMS.map((room) => (
            <button
              key={room.id}
              type="button"
              aria-label={`${room.label} — ${room.sub}`}
              onClick={() => navigate(room.route)}
              className="min-h-[72px] w-full flex items-center gap-4 px-5 py-3 rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] focus:outline-none focus-visible:ring-4 focus-visible:ring-white transition-colors text-left"
            >
              <span aria-hidden="true" className="text-3xl">
                {room.emoji}
              </span>
              <span className="flex flex-col">
                <span className="text-lg font-medium">{room.label}</span>
                <span className="text-base" style={{ color: MUTED }}>
                  {room.sub}
                </span>
              </span>
            </button>
          ))}
        </nav>

        <p className="mt-8 text-base" style={{ color: MUTED }}>
          Keyboard: press S for emergency help, Escape to return home.
        </p>
      </main>

      {/* Rendered last: final stop in tab order, always reachable */}
      <SosButton />
    </div>
  );
}
