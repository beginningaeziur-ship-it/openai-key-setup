import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RoomLayout, RoomSection, ROOM_ACCENT, ROOM_MUTED } from "@/components/rooms/RoomLayout";

const PREFS_KEY = "sai_settings_prefs";

export interface SaiPrefs {
  lowContrast: boolean;
  lowStimulus: boolean;
  largerText: boolean;
  storeOnDevice: boolean;
}

const DEFAULTS: SaiPrefs = {
  lowContrast: false,
  lowStimulus: false,
  largerText: false,
  storeOnDevice: true,
};

export function loadPrefs(): SaiPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<SaiPrefs>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function applyPrefs(prefs: SaiPrefs) {
  const root = document.documentElement;
  root.classList.toggle("sai-low-contrast", prefs.lowContrast);
  root.classList.toggle("sai-low-stimulus", prefs.lowStimulus);
  root.style.fontSize = prefs.largerText ? "20px" : "";
}

function Toggle({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`${label}. ${description}`}
      onClick={() => onChange(!checked)}
      className="min-h-[64px] w-full flex items-center justify-between gap-4 px-5 rounded-2xl border border-white/25 bg-white/[0.06] text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
    >
      <span className="flex flex-col">
        <span className="text-lg font-medium">{label}</span>
        <span className="text-base" style={{ color: ROOM_MUTED }}>
          {description}
        </span>
      </span>
      <span
        aria-hidden="true"
        className="shrink-0 rounded-full px-3 py-2 text-base font-semibold border border-white/40"
        style={{ backgroundColor: checked ? ROOM_ACCENT : "transparent" }}
      >
        {checked ? "On" : "Off"}
      </span>
    </button>
  );
}

export default function SettingsRoom() {
  const [prefs, setPrefs] = useState<SaiPrefs>(loadPrefs);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    applyPrefs(prefs);
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      /* storage unavailable */
    }
  }, [prefs]);

  const set = (key: keyof SaiPrefs, value: boolean) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    setAnnouncement(`${key} ${value ? "on" : "off"}`);
  };

  const exportData = () => {
    const data: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sai_")) data[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sai-my-data.json";
    a.click();
    URL.revokeObjectURL(url);
    setAnnouncement("Your data was downloaded as a JSON file.");
  };

  return (
    <RoomLayout title="Settings" subtitle="Comfort, contrast, and privacy.">
      <p role="status" aria-live="polite" className="text-base min-h-[1.5rem]" style={{ color: ROOM_MUTED }}>
        {announcement}
      </p>

      <RoomSection heading="Comfort">
        <Toggle
          id="low-contrast"
          label="Low-contrast mode"
          description="Softer edges and gentler brightness."
          checked={prefs.lowContrast}
          onChange={(v) => set("lowContrast", v)}
        />
        <Toggle
          id="low-stimulus"
          label="Low-stimulus mode"
          description="Reduces motion and animation across the app."
          checked={prefs.lowStimulus}
          onChange={(v) => set("lowStimulus", v)}
        />
        <Toggle
          id="larger-text"
          label="Larger text"
          description="Increases text size everywhere."
          checked={prefs.largerText}
          onChange={(v) => set("largerText", v)}
        />
      </RoomSection>

      <RoomSection heading="Privacy" note="Nothing here leaves this device.">
        <Toggle
          id="store-on-device"
          label="Store my data on this device"
          description="Keeps your settings and vault between visits."
          checked={prefs.storeOnDevice}
          onChange={(v) => set("storeOnDevice", v)}
        />
        <button
          type="button"
          aria-label="Export my data as a JSON file"
          onClick={exportData}
          className="min-h-[64px] w-full rounded-2xl text-white text-lg font-semibold px-5 focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
          style={{ backgroundColor: ROOM_ACCENT }}
        >
          Export my data
        </button>
      </RoomSection>

      <RoomSection heading="Language">
        <label htmlFor="language" className="text-base">
          Language (English only for now)
        </label>
        <select
          id="language"
          disabled
          className="min-h-[48px] w-full rounded-xl bg-white/10 border border-white/25 px-4 text-base text-white"
        >
          <option>English</option>
        </select>
      </RoomSection>

      <RoomSection heading="Advanced settings" note="Voice, pacing, and companion tuning.">
        <Link
          to="/settings/advanced"
          aria-label="Open advanced settings"
          className="min-h-[64px] w-full flex items-center rounded-2xl border border-white/25 px-5 text-lg font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
        >
          Open advanced settings
        </Link>
      </RoomSection>
    </RoomLayout>
  );
}
