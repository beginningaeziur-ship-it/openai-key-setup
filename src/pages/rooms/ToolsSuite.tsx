import { useEffect, useRef, useState } from "react";
import {
  RoomLayout,
  RoomSection,
  ComingSoonCard,
  ROOM_ACCENT,
  ROOM_MUTED,
} from "@/components/rooms/RoomLayout";

/** 4-4-4-4 box breathing. Volatile state only. */
const PHASES = [
  { label: "Breathe in", scale: 1.6 },
  { label: "Hold", scale: 1.6 },
  { label: "Breathe out", scale: 1 },
  { label: "Hold", scale: 1 },
] as const;

function BoxBreathing() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    timer.current = setInterval(() => setPhase((p) => (p + 1) % PHASES.length), 4000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [running]);

  const current = PHASES[phase];

  return (
    <RoomSection heading="Box breathing (4-4-4-4)" note="In for four, hold four, out for four, hold four.">
      <div className="flex justify-center py-4">
        <div
          aria-hidden="true"
          className="rounded-full motion-reduce:transition-none"
          style={{
            width: 120,
            height: 120,
            backgroundColor: ROOM_ACCENT,
            transform: `scale(${running ? current.scale : 1})`,
            transition: "transform 4s ease-in-out",
          }}
        />
      </div>
      <p role="status" aria-live="polite" className="text-xl text-center font-medium">
        {running ? `${current.label}…` : "Ready when you are."}
      </p>
      <button
        type="button"
        aria-label={running ? "Stop box breathing" : "Start box breathing"}
        onClick={() => {
          setPhase(0);
          setRunning((r) => !r);
        }}
        className="min-h-[64px] w-full rounded-2xl text-lg font-semibold px-5 text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
        style={{ backgroundColor: running ? "#455A64" : ROOM_ACCENT }}
      >
        {running ? "Stop" : "Start"}
      </button>
    </RoomSection>
  );
}

const SENSES = [
  "Name 5 things you can see.",
  "Name 4 things you can hear.",
  "Name 3 things you can touch.",
  "Name 2 things you can smell.",
  "Name 1 thing you can taste.",
];

function SensoryGrounding() {
  const [step, setStep] = useState(0);
  const done = step >= SENSES.length;

  return (
    <RoomSection heading="5-4-3-2-1 grounding" note="One prompt at a time. No rush.">
      <p role="status" aria-live="polite" className="text-xl font-medium">
        {done ? "That's all five. You're here, and you did that." : SENSES[step]}
      </p>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          aria-label={done ? "Start 5-4-3-2-1 grounding again" : "Next grounding prompt"}
          onClick={() => setStep((s) => (done ? 0 : s + 1))}
          className="min-h-[64px] w-full rounded-2xl text-lg font-semibold px-5 text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
          style={{ backgroundColor: ROOM_ACCENT }}
        >
          {done ? "Start again" : "Next"}
        </button>
        {step > 0 && !done && (
          <button
            type="button"
            aria-label="Previous grounding prompt"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="min-h-[48px] w-full rounded-xl border border-white/25 text-base font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
          >
            Back
          </button>
        )}
      </div>
    </RoomSection>
  );
}

export default function ToolsSuite() {
  return (
    <RoomLayout title="Tools Suite" subtitle="Grounding and calming tools.">
      <p className="text-base" style={{ color: ROOM_MUTED }}>
        Nothing in this room is saved. Use a tool, leave it behind.
      </p>

      <BoxBreathing />
      <SensoryGrounding />

      <RoomSection heading="More tools" note="Being built. Labeled honestly until they work.">
        <ComingSoonCard label="Binaural anchors" detail="Tone pairs for focus and settling." />
        <ComingSoonCard label="Vagal audio" detail="Humming and low-tone regulation audio." />
        <ComingSoonCard label="HRV monitor" detail="Heart-rate variability read-out." />
        <ComingSoonCard label="TENS timer" detail="Timed prompts for TENS unit sessions." />
        <ComingSoonCard label="Thermal reminders" detail="Cold water and warmth prompts." />
        <ComingSoonCard label="Micro-stretch cards" detail="Seated and bed-friendly stretches." />
        <ComingSoonCard label="Tactile biofeedback" detail="Vibration-paced breathing." />
        <ComingSoonCard label="Flashback-disruption audio" detail="Orientation audio for dissociation." />
      </RoomSection>
    </RoomLayout>
  );
}
