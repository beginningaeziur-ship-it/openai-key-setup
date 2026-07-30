# SAI — an accessibility-first companion, powered by Aezuir

SAI is an accessibility-first companion app for blind and disabled users, built by a blind founder. It is screen-reader-native: semantic landmarks on every page, real labels on every control, live-region announcements, 48px+ touch targets, and an emergency SOS control that is always the last focusable element in tab order. Keyboard shortcuts work everywhere (`S` opens SOS, `Escape` returns home).

## Who it is for

People living with blindness, disability, chronic illness, trauma, or life instability who need support that can be reached and completed by voice or keyboard alone. SAI is not a doctor, therapist, or lawyer.

## Room-based structure

The home screen is a set of large, labeled room buttons:

- **Living Room** — vent entry, morning roadmap, afternoon check-in, Three Good Things. Text is volatile; nothing is retained.
- **Playroom** — the animated companion plus non-punitive care actions (feed, water, medication check-off). The companion never dies, degrades, or guilt-trips.
- **Tools Suite** — working 4-4-4-4 box-breathing orb and 5-4-3-2-1 sensory grounding grid. Binaural anchors, vagal audio, HRV monitor, TENS timer, thermal reminders, micro-stretch cards, tactile biofeedback, and flashback-disruption audio are planned, not shipped.
- **Advocacy** — a local-only (device storage) vital document vault. The resource atlas and legal templates are planned.
- **Settings** — persisted comfort toggles (low contrast, low stimulus, larger text, on-device storage) and a JSON export of local data.
- **Bedroom / Inner Sanctum** — a 4-digit PIN gate (hashed) protecting a brain-dump journal that purges on exit unless exported.

## Conversation

SAI Chat supports a normal mode, a **vent mode** that validates without problem-solving, and a **crisis mode** safety switch that locks the interface to exactly two options: a 988 crisis-counselor handoff or building an immediate safety plan.

## Other systems

- **Goal fracturing** — long goals break down into medium, micro, and mini-micro steps; uncompleted goals roll forward with no failure marker.
- **State engine** — a Normal / Reduced / Support / Offline state that adapts tone, choice count, and text size.
- **Privacy** — journals and entries are save-to-device or discarded; they are not stored in the cloud.

## Tech

Vite, React, TypeScript, Tailwind CSS, shadcn-ui, with a Lovable Cloud backend for chat, speech-to-text, and text-to-speech functions.
