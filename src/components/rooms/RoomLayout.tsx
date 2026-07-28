import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { StateIndicator } from "@/engine/StateIndicator";
import { SosButton } from "@/components/a11y/SosButton";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useGlobalA11yShortcuts } from "@/hooks/useGlobalA11yShortcuts";

export const ROOM_BG = "#0A1628";
export const ROOM_ACCENT = "#028090";
export const ROOM_MUTED = "#B0BEC5";

interface RoomLayoutProps {
  /** Used for document.title as "SAI - {title}" and the page h1. */
  title: string;
  /** One-line purpose shown under the heading. */
  subtitle?: string;
  children: ReactNode;
}

/**
 * Shared accessible shell for every room page.
 * SOS is rendered last so it stays the final element in tab order.
 */
export function RoomLayout({ title, subtitle, children }: RoomLayoutProps) {
  usePageTitle(`SAI - ${title}`);
  useGlobalA11yShortcuts();

  return (
    <div className="min-h-dvh flex flex-col text-white" style={{ backgroundColor: ROOM_BG }}>
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/15">
        <Link
          to="/sai-home"
          aria-label="Back to home"
          className="min-h-[48px] min-w-[48px] inline-flex items-center gap-2 px-2 rounded-xl text-base font-medium focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
          style={{ color: ROOM_MUTED }}
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          Home
        </Link>
        <StateIndicator />
      </header>

      <main
        role="main"
        aria-label={title}
        className="flex-1 flex flex-col px-5 pt-6 pb-44 max-w-xl w-full mx-auto"
      >
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-lg" style={{ color: ROOM_MUTED }}>
            {subtitle}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-6">{children}</div>
      </main>

      {/* Rendered last: final stop in tab order */}
      <SosButton />
    </div>
  );
}

export function RoomSection({
  heading,
  children,
  note,
}: {
  heading: string;
  children: ReactNode;
  note?: string;
}) {
  const id = heading.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <section aria-labelledby={id} className="rounded-2xl border border-white/15 bg-white/[0.06] p-4">
      <h2 id={id} className="text-xl font-semibold">
        {heading}
      </h2>
      {note && (
        <p className="mt-1 text-base" style={{ color: ROOM_MUTED }}>
          {note}
        </p>
      )}
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </section>
  );
}

export function ComingSoonCard({ label, detail }: { label: string; detail: string }) {
  return (
    <div
      className="rounded-2xl border border-white/15 bg-white/[0.03] p-4"
      aria-label={`${label} — coming soon. ${detail}`}
      role="group"
    >
      <p className="text-lg font-medium">
        {label} <span style={{ color: ROOM_MUTED }}>— coming soon</span>
      </p>
      <p className="text-base" style={{ color: ROOM_MUTED }}>
        {detail}
      </p>
    </div>
  );
}
