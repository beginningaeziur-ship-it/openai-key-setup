import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StateIndicator } from "@/engine/StateIndicator";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useGlobalA11yShortcuts, SOS_EVENT } from "@/hooks/useGlobalA11yShortcuts";
import { getTimeOfDay } from "@/lib/timeGreeting";

/**
 * SAIHome — the main home screen.
 * Dark navy background, teal accent, high-contrast white text.
 * SOS is fixed to the bottom and is the last focusable element on the page.
 */

const BG = "#0A1628";
const ACCENT = "#028090";
const MUTED = "#B0BEC5";
const DANGER = "#DC2626";
const QUICK_EXIT_URL = "https://weather.com";

interface Room {
  id: string;
  emoji: string;
  label: string;
  sub: string;
  route: string;
}

const ROOMS: Room[] = [
  { id: "bedroom", emoji: "🛏️", label: "Bedroom", sub: "Daily grounding", route: "/bedroom" },
  { id: "ocean", emoji: "🌊", label: "Ocean", sub: "Calm & regulate", route: "/ocean" },
  { id: "forest", emoji: "🌲", label: "Forest", sub: "Goals & learning", route: "/forest" },
  { id: "cabin", emoji: "🏡", label: "Cabin", sub: "Settings", route: "/cabin" },
];

function quickExit() {
  window.location.replace(QUICK_EXIT_URL);
}

export default function SAIHome() {
  const navigate = useNavigate();
  usePageTitle("SAI - Home");
  useGlobalA11yShortcuts();

  const { greeting, checkInQuestion } = getTimeOfDay();
  const [sosOpen, setSosOpen] = useState(false);
  const sosTriggerRef = useRef<HTMLButtonElement>(null);
  const firstOptionRef = useRef<HTMLAnchorElement>(null);

  const closeSos = useCallback(() => {
    setSosOpen(false);
    sosTriggerRef.current?.focus();
  }, []);

  // "S" shortcut anywhere opens the SOS flow.
  useEffect(() => {
    const handler = () => setSosOpen(true);
    document.addEventListener(SOS_EVENT, handler);
    return () => document.removeEventListener(SOS_EVENT, handler);
  }, []);

  // Escape closes the modal; focus moves into it when it opens.
  useEffect(() => {
    if (!sosOpen) return;
    firstOptionRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeSos();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [sosOpen, closeSos]);

  return (
    <div className="min-h-dvh flex flex-col text-white" style={{ backgroundColor: BG }}>
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/15">
        <span className="text-[24px] font-bold" style={{ color: ACCENT }}>
          SAI
        </span>
        <div className="flex items-center gap-3">
          <StateIndicator />
          <button
            type="button"
            onClick={quickExit}
            aria-label="Quick exit — leave this app now and open a weather site"
            className="min-h-[44px] min-w-[44px] px-3 rounded-lg border border-white/30 text-sm font-medium text-white/90 hover:bg-white/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
          >
            <span aria-hidden="true">⚡ </span>Exit
          </button>
        </div>
      </header>

      <main
        role="main"
        aria-label="SAI home"
        className="flex-1 flex flex-col px-5 pt-8 pb-40 max-w-xl w-full mx-auto"
      >
        <section aria-labelledby="sai-greeting" className="mb-10 text-center">
          <h1 id="sai-greeting" className="text-4xl sm:text-5xl font-semibold tracking-tight">
            {greeting}
          </h1>
          <p className="mt-3 text-xl" style={{ color: MUTED }}>
            {checkInQuestion}
          </p>
        </section>

        <nav aria-label="Rooms" className="flex flex-col gap-3">
          {ROOMS.map((room) => (
            <button
              key={room.id}
              type="button"
              aria-label={`${room.label} — ${room.sub}`}
              onClick={() => navigate(room.route)}
              className="min-h-[72px] w-full flex items-center gap-4 px-5 py-3 rounded-2xl border-2 bg-white/[0.06] hover:bg-white/[0.12] focus:outline-none focus-visible:ring-4 focus-visible:ring-white transition-colors text-left text-white"
              style={{ borderColor: ACCENT }}
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

        <button
          type="button"
          onClick={() => navigate("/chat")}
          aria-label="Talk to SAI"
          className="mt-6 min-h-[64px] w-full rounded-2xl text-white text-lg font-semibold px-5 focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
          style={{ backgroundColor: ACCENT }}
        >
          Talk to SAI
        </button>

        <p className="mt-8 text-base" style={{ color: MUTED }}>
          Keyboard: press S for emergency help, Escape to return home.
        </p>
      </main>

      {/* Fixed emergency bar — last focusable element on the page */}
      <button
        ref={sosTriggerRef}
        type="button"
        role="button"
        tabIndex={0}
        aria-label="Emergency SOS - tap for immediate help"
        aria-haspopup="dialog"
        onClick={() => setSosOpen(true)}
        className="fixed left-0 right-0 bottom-0 h-[56px] text-white text-[18px] font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
        style={{ backgroundColor: DANGER, zIndex: 9999 }}
      >
        <span aria-hidden="true">🆘 </span>SOS — Get Help Now
      </button>

      {sosOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center p-5"
          style={{ backgroundColor: "rgba(0,0,0,0.85)", zIndex: 10000 }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sos-title"
            className="w-full max-w-md rounded-2xl border border-white/20 p-5"
            style={{ backgroundColor: BG }}
          >
            <h2 id="sos-title" className="text-2xl font-semibold text-white">
              You're not alone. Choose one.
            </h2>
            <div className="flex flex-col gap-3 mt-4">
              <a
                ref={firstOptionRef}
                href="tel:988"
                aria-label="Call 988 Suicide and Crisis Lifeline"
                className="min-h-[64px] flex items-center justify-center rounded-2xl text-white text-lg font-semibold px-5 text-center focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
                style={{ backgroundColor: DANGER }}
              >
                Call 988 Suicide &amp; Crisis Lifeline
              </a>
              <a
                href="tel:18007997233"
                aria-label="Call the National Domestic Violence Hotline, 1 800 799 7233"
                className="min-h-[64px] flex items-center justify-center rounded-2xl text-white text-lg font-semibold px-5 text-center focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
                style={{ backgroundColor: ACCENT }}
              >
                Call National DV Hotline
              </a>
              <button
                type="button"
                onClick={quickExit}
                aria-label="Quick exit — leave this app now and open a weather site"
                className="min-h-[64px] rounded-2xl border-2 border-white/40 text-white text-lg font-semibold px-5 focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
              >
                <span aria-hidden="true">⚡ </span>Quick Exit
              </button>
            </div>
            <p className="mt-4 text-base" style={{ color: MUTED }}>
              Press Escape to close this.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
