import { useEffect, useState } from "react";
import {
  RoomLayout,
  RoomSection,
  ComingSoonCard,
  ROOM_ACCENT,
  ROOM_MUTED,
} from "@/components/rooms/RoomLayout";

const VAULT_KEY = "sai_document_vault";

interface VaultEntry {
  id: string;
  text: string;
}

function loadVault(): VaultEntry[] {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    return raw ? (JSON.parse(raw) as VaultEntry[]) : [];
  } catch {
    return [];
  }
}

/**
 * Advocacy & Resource Room.
 * The document vault is LOCAL ONLY (localStorage). Nothing is uploaded.
 * No clinical diagnoses are stored or displayed here.
 */
export default function Advocacy() {
  const [entries, setEntries] = useState<VaultEntry[]>(loadVault);
  const [draft, setDraft] = useState("");
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(VAULT_KEY, JSON.stringify(entries));
    } catch {
      /* storage unavailable — vault stays in memory for this session */
    }
  }, [entries]);

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    setEntries((prev) => [...prev, { id: Math.random().toString(36).slice(2), text }]);
    setDraft("");
    setAnnouncement(`Added ${text} to your device vault.`);
  };

  return (
    <RoomLayout title="Advocacy" subtitle="Resources, documents, and help.">
      <RoomSection heading="Resource atlas" note="Shelter, food, and support locations.">
        <ComingSoonCard
          label="Offline-cached resource atlas"
          detail="Nearby shelter, food, and support listings, downloaded so they work without signal."
        />
      </RoomSection>

      <RoomSection
        heading="Vital document vault"
        note="Stays on this device, never uploaded. Note which documents you have — not their numbers."
      >
        <label htmlFor="vault-entry" className="text-base">
          Document you have
        </label>
        <input
          id="vault-entry"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Birth certificate"
          className="w-full min-h-[48px] rounded-xl bg-white/10 border border-white/25 px-4 py-3 text-base text-white placeholder:text-[#B0BEC5] focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
        />
        <button
          type="button"
          aria-label="Add document to the on-device vault"
          onClick={add}
          className="min-h-[48px] rounded-xl text-white text-base font-semibold px-5 focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
          style={{ backgroundColor: ROOM_ACCENT }}
        >
          Add to vault
        </button>
        <p role="status" aria-live="polite" className="text-base" style={{ color: ROOM_MUTED }}>
          {announcement}
        </p>
        <ul className="flex flex-col gap-2">
          {entries.length === 0 ? (
            <li className="text-base" style={{ color: ROOM_MUTED }}>
              Vault is empty. Common ones: birth certificate, state ID, SSI paperwork.
            </li>
          ) : (
            entries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 text-base">
                <span>{entry.text}</span>
                <button
                  type="button"
                  aria-label={`Remove ${entry.text} from the vault`}
                  onClick={() => setEntries((prev) => prev.filter((e) => e.id !== entry.id))}
                  className="min-h-[48px] min-w-[48px] rounded-xl border border-white/25 px-3 focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
                >
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>
      </RoomSection>

      <RoomSection heading="Legal templates" note="Letters and forms you can adapt.">
        <ComingSoonCard label="Legal templates" detail="Appeal letters, accommodation requests, housing notices." />
      </RoomSection>
    </RoomLayout>
  );
}
