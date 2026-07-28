import { useState } from "react";
import { FullBodySAI } from "@/components/sai/FullBodySAI";
import { RoomLayout, RoomSection, ROOM_ACCENT, ROOM_MUTED } from "@/components/rooms/RoomLayout";

/**
 * Playroom — companion mirror.
 * ZERO-DEATH RULE: the companion never dies, degrades, withers, or guilt-trips.
 * Every string here is gentle and non-punitive. Volatile state only.
 */
export default function Playroom() {
  const [fed, setFed] = useState(false);
  const [watered, setWatered] = useState(false);
  const [meds, setMeds] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const act = (kind: "fed" | "watered" | "meds") => {
    if (kind === "fed") {
      setFed(true);
      setAnnouncement("You ate, so SAI ate. He's happy either way.");
    } else if (kind === "watered") {
      setWatered(true);
      setAnnouncement("You drank, so SAI drank. Nice one.");
    } else {
      setMeds(true);
      setAnnouncement("Medication marked. That's care, not a chore.");
    }
  };

  const actionClass =
    "min-h-[64px] w-full rounded-2xl text-lg font-semibold px-5 border border-white/25 focus:outline-none focus-visible:ring-4 focus-visible:ring-white";

  return (
    <RoomLayout title="Playroom" subtitle="Your companion and daily care.">
      <div className="flex justify-center" aria-hidden="true">
        <FullBodySAI size="lg" state="attentive" className="origin-bottom pointer-events-none" />
      </div>

      <p role="status" aria-live="polite" className="text-base min-h-[1.5rem]">
        {announcement}
      </p>

      <RoomSection
        heading="Care mirror"
        note="Tap these when you eat or drink. SAI does what you do — he's always okay either way."
      >
        <button type="button" onClick={() => act("fed")} className={actionClass} aria-label={fed ? "Fed SAI, tap again any time" : "Feed SAI — tap when you eat"}>
          {fed ? "Fed together ✓" : "Feed SAI"}
        </button>
        <button type="button" onClick={() => act("watered")} className={actionClass} aria-label={watered ? "Gave SAI water, tap again any time" : "Give SAI water — tap when you drink"}>
          {watered ? "Water together ✓" : "Give SAI water"}
        </button>
        <p className="text-base" style={{ color: ROOM_MUTED }}>
          If you haven't yet, that's fine. SAI is comfortable, resting, and waiting with you. He never
          gets hungry, sad, or sick — he's here for company, not pressure.
        </p>
      </RoomSection>

      <RoomSection heading="Medication check-off" note="Only if you take any. Skipping is not a failure.">
        <button
          type="button"
          onClick={() => act("meds")}
          aria-pressed={meds}
          className={actionClass}
          style={meds ? { backgroundColor: ROOM_ACCENT } : undefined}
        >
          {meds ? "Medication taken ✓" : "Mark medication taken"}
        </button>
      </RoomSection>
    </RoomLayout>
  );
}
