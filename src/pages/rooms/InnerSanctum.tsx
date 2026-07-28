import { useEffect, useRef, useState } from "react";
import { Delete } from "lucide-react";
import { RoomLayout, RoomSection, ROOM_ACCENT, ROOM_MUTED } from "@/components/rooms/RoomLayout";

const PIN_KEY = "sai_sanctum_pin_hash";

async function hashPin(pin: string): Promise<string> {
  const bytes = new TextEncoder().encode(`sai-sanctum:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

type Phase = "set" | "confirm" | "enter" | "open";

/**
 * Bedroom — Inner Sanctum.
 * PIN-gated (hashed in localStorage). The journal is volatile: it purges
 * on exit unless the user exports it as a text file.
 */
export default function InnerSanctum() {
  const storedHash = typeof localStorage !== "undefined" ? localStorage.getItem(PIN_KEY) : null;
  const [phase, setPhase] = useState<Phase>(storedHash ? "enter" : "set");
  const [pin, setPin] = useState("");
  const [firstPin, setFirstPin] = useState("");
  const [message, setMessage] = useState("");
  const [journal, setJournal] = useState("");
  const busy = useRef(false);

  // Purge the journal when the room unmounts.
  useEffect(() => () => setJournal(""), []);

  useEffect(() => {
    if (pin.length !== 4 || busy.current) return;
    busy.current = true;
    (async () => {
      if (phase === "set") {
        setFirstPin(pin);
        setPin("");
        setPhase("confirm");
        setMessage("Enter the same four digits again to confirm.");
      } else if (phase === "confirm") {
        if (pin === firstPin) {
          localStorage.setItem(PIN_KEY, await hashPin(pin));
          setPin("");
          setPhase("open");
          setMessage("PIN set. Welcome in.");
        } else {
          setPin("");
          setFirstPin("");
          setPhase("set");
          setMessage("Those didn't match. Let's set it again, no rush.");
        }
      } else if (phase === "enter") {
        const hash = await hashPin(pin);
        if (hash === localStorage.getItem(PIN_KEY)) {
          setPin("");
          setPhase("open");
          setMessage("Welcome in.");
        } else {
          setPin("");
          setMessage("That's not quite right. Take your time.");
        }
      }
      busy.current = false;
    })();
  }, [pin, phase, firstPin]);

  const exportJournal = () => {
    const blob = new Blob([journal], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sai-brain-dump.txt";
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Exported to your device.");
  };

  if (phase === "open") {
    return (
      <RoomLayout title="Bedroom" subtitle="Your private inner sanctum. No one can change your system without this PIN.">
        <p role="status" aria-live="polite" className="text-base" style={{ color: ROOM_MUTED }}>
          {message}
        </p>
        <RoomSection
          heading="Brain dump"
          note="This clears when you leave the room. Export it first if you want to keep it."
        >
          <label htmlFor="braindump" className="text-base">
            Write anything
          </label>
          <textarea
            id="braindump"
            rows={10}
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="Everything you're holding."
            className="w-full rounded-xl bg-white/10 border border-white/25 px-4 py-3 text-base text-white placeholder:text-[#B0BEC5] focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
          />
          <button
            type="button"
            aria-label="Export brain dump as a text file"
            onClick={exportJournal}
            className="min-h-[64px] w-full rounded-2xl text-white text-lg font-semibold px-5 focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
            style={{ backgroundColor: ROOM_ACCENT }}
          >
            Export
          </button>
        </RoomSection>
      </RoomLayout>
    );
  }

  const prompt =
    phase === "set"
      ? "Set a four-digit PIN for your inner sanctum."
      : phase === "confirm"
        ? "Confirm your four-digit PIN."
        : "Enter your four-digit PIN.";

  return (
    <RoomLayout title="Bedroom" subtitle="Your private inner sanctum. No one can change your system without this PIN.">
      <RoomSection heading="PIN">
        <p role="status" aria-live="polite" className="text-lg">
          {prompt} {message}
        </p>
        <p role="status" aria-live="polite" className="text-base" style={{ color: ROOM_MUTED }}>
          {pin.length} of 4 digits entered
        </p>

        <div className="grid grid-cols-3 gap-3" role="group" aria-label="Number pad">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button
              key={d}
              type="button"
              aria-label={`Digit ${d}`}
              onClick={() => setPin((p) => (p.length < 4 ? p + d : p))}
              className="min-h-[64px] min-w-[64px] rounded-2xl border border-white/25 text-xl font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            aria-label="Clear all digits"
            onClick={() => setPin("")}
            className="min-h-[64px] min-w-[64px] rounded-2xl border border-white/25 text-base font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
          >
            Clear
          </button>
          <button
            type="button"
            aria-label="Digit 0"
            onClick={() => setPin((p) => (p.length < 4 ? p + "0" : p))}
            className="min-h-[64px] min-w-[64px] rounded-2xl border border-white/25 text-xl font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
          >
            0
          </button>
          <button
            type="button"
            aria-label="Delete last digit"
            onClick={() => setPin((p) => p.slice(0, -1))}
            className="min-h-[64px] min-w-[64px] rounded-2xl border border-white/25 flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
          >
            <Delete className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </RoomSection>
    </RoomLayout>
  );
}
