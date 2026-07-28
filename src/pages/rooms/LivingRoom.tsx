import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RoomLayout, RoomSection, ROOM_ACCENT, ROOM_MUTED } from "@/components/rooms/RoomLayout";

/**
 * Living Room — 24/7 support room.
 * ZERO permanent retention: every value here lives in component state only
 * and is gone on reload. Nothing is written to storage or the network.
 */
export default function LivingRoom() {
  const navigate = useNavigate();
  const [intentions, setIntentions] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [good, setGood] = useState<[string, string, string]>(["", "", ""]);

  const addIntention = () => {
    const t = draft.trim();
    if (!t) return;
    setIntentions((prev) => [...prev, t]);
    setDraft("");
  };

  const inputClass =
    "w-full min-h-[48px] rounded-xl bg-white/10 border border-white/25 px-4 py-3 text-base text-white placeholder:text-[#B0BEC5] focus:outline-none focus-visible:ring-4 focus-visible:ring-white";

  return (
    <RoomLayout title="Living Room" subtitle="Vent, check in, and reset.">
      <p className="text-base" style={{ color: ROOM_MUTED }}>
        Nothing you type in this room is saved. It disappears when you leave or reload.
      </p>

      <RoomSection heading="Vent" note="Say it all. SAI listens, no advice, no fixing.">
        <button
          type="button"
          aria-label="Open vent mode with SAI"
          onClick={() => navigate("/chat?mode=vent")}
          className="min-h-[64px] w-full rounded-2xl text-white text-lg font-semibold px-5 focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
          style={{ backgroundColor: ROOM_ACCENT }}
        >
          Start venting
        </button>
      </RoomSection>

      <RoomSection heading="Morning roadmap" note="A few simple intentions for today.">
        <label htmlFor="intention" className="text-base">
          Add an intention
        </label>
        <input
          id="intention"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addIntention();
            }
          }}
          placeholder="Drink water"
          className={inputClass}
        />
        <button
          type="button"
          aria-label="Add this intention to today's roadmap"
          onClick={addIntention}
          className="min-h-[48px] rounded-xl border border-white/25 text-base font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
        >
          Add
        </button>
        <ul aria-live="polite" className="flex flex-col gap-2">
          {intentions.length === 0 ? (
            <li className="text-base" style={{ color: ROOM_MUTED }}>
              No intentions yet. Any number is enough, including none.
            </li>
          ) : (
            intentions.map((item, i) => (
              <li key={`${item}-${i}`} className="flex items-center justify-between gap-3 text-base">
                <span>{item}</span>
                <button
                  type="button"
                  aria-label={`Remove intention: ${item}`}
                  onClick={() => setIntentions((prev) => prev.filter((_, idx) => idx !== i))}
                  className="min-h-[48px] min-w-[48px] rounded-xl border border-white/25 px-3 focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
                >
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>
      </RoomSection>

      <RoomSection heading="Afternoon check-in" note="How is the day sitting with you right now?">
        <label htmlFor="checkin" className="text-base">
          Your check-in
        </label>
        <textarea
          id="checkin"
          rows={3}
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          placeholder="Heavy, but still here."
          className={inputClass}
        />
      </RoomSection>

      <RoomSection heading="Three Good Things" note="Small counts. Tiny counts.">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <label htmlFor={`good-${i}`} className="text-base">
              Good thing {i + 1}
            </label>
            <input
              id={`good-${i}`}
              type="text"
              value={good[i]}
              onChange={(e) => {
                const next = [...good] as [string, string, string];
                next[i] = e.target.value;
                setGood(next);
              }}
              className={inputClass}
            />
          </div>
        ))}
      </RoomSection>
    </RoomLayout>
  );
}
