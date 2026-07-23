/**
 * Vent Mode + Crisis Mode detection.
 * Pure logic, no UI. Client-side keyword matching.
 */

export type ChatMode = "normal" | "vent" | "crisis";

const VENT_ENTER = [
  /\bjust\s+(need\s+to\s+)?vent\b/i,
  /\bjust\s+listen\b/i,
  /\bdon'?t\s+(give\s+me\s+)?advice\b/i,
  /\bno\s+advice\b/i,
  /\bdon'?t\s+fix\b/i,
  /\bjust\s+let\s+me\s+talk\b/i,
  /\bhear\s+me\s+out\b/i,
];

const VENT_EXIT = [
  /^\s*(ok|okay|thanks|thank you|thx|done|i'?m done|that'?s enough)\s*[.!]?\s*$/i,
  /\bwhat\s+should\s+i\s+do\b/i,
  /\bhelp\s+me\b/i,
  /\bany\s+advice\b/i,
];

const CRISIS_ENTER = [
  /\bwant to die\b/i,
  /\bkill (myself|me)\b/i,
  /\bsuicid/i,
  /\bcan'?t go on\b/i,
  /\bend (it|my life|it all)\b/i,
  /\bcrisis\b/i,
  /\bhurt myself\b/i,
];

// Words suggesting the user has stabilized enough to leave crisis mode.
const CRISIS_EXIT = [
  /\bi'?m (ok|okay|safe|calmer|better)\b/i,
  /\bfeeling (better|calmer|safer)\b/i,
  /\bi'?m breathing\b/i,
  /\bthank you\b/i,
];

export function detectMode(text: string, current: ChatMode): ChatMode {
  const t = text.trim();

  // Crisis always overrides.
  if (CRISIS_ENTER.some((r) => r.test(t))) return "crisis";

  if (current === "crisis") {
    return CRISIS_EXIT.some((r) => r.test(t)) ? "normal" : "crisis";
  }

  if (current === "vent") {
    return VENT_EXIT.some((r) => r.test(t)) ? "normal" : "vent";
  }

  if (VENT_ENTER.some((r) => r.test(t))) return "vent";
  return "normal";
}

const VENT_REPLIES = [
  "I hear you.",
  "Keep going.",
  "That sounds heavy.",
  "I'm here.",
  "Mm.",
  "Yeah.",
  "Still listening.",
];

export function ventReply(): string {
  return VENT_REPLIES[Math.floor(Math.random() * VENT_REPLIES.length)];
}
