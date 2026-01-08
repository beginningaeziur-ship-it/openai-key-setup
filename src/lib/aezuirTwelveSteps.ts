/**
 * AEZUIR TWELVE STEPS
 * CANONICAL - DO NOT EDIT
 * 
 * These replace all traditional AA steps.
 * Wording is locked exactly as specified.
 */

export const AEZUIR_TWELVE_STEPS = [
  {
    number: 1,
    title: "Notice what keeps happening",
    description: "Recognize patterns without judgment. Just see them.",
  },
  {
    number: 2,
    title: "Protect who you are",
    description: "Your identity stays intact. You are not your coping.",
  },
  {
    number: 3,
    title: "Get steady first",
    description: "Stability before insight. Ground before growth.",
  },
  {
    number: 4,
    title: "Track stability, not perfection",
    description: "Measure steadiness, not streaks. Progress isn't linear.",
  },
  {
    number: 5,
    title: "Separate you from the coping",
    description: "The behavior served a purpose. You are more than the behavior.",
  },
  {
    number: 6,
    title: "See the pattern loop",
    description: "Trigger → urge → action → relief → shame → trigger. Break the loop.",
  },
  {
    number: 7,
    title: "Try one small different choice",
    description: "Not a big change. Just one small different step.",
  },
  {
    number: 8,
    title: "Replace the need, not just the habit",
    description: "Find what the coping was giving you. Meet that need safely.",
  },
  {
    number: 9,
    title: "Own the impact without self-destruction",
    description: "Accountability doesn't require punishment. Repair, don't destroy.",
  },
  {
    number: 10,
    title: "Repair what you can, safely",
    description: "Make amends where possible without re-traumatizing yourself or others.",
  },
  {
    number: 11,
    title: "Practice stability daily",
    description: "Small consistent actions. Not grand gestures.",
  },
  {
    number: 12,
    title: "Grow independence",
    description: "The goal is to need less support over time. Not dependency.",
  },
] as const;

export type AEZUIRStep = typeof AEZUIR_TWELVE_STEPS[number];

// Get step by number
export function getStep(number: number): AEZUIRStep | undefined {
  return AEZUIR_TWELVE_STEPS.find(s => s.number === number);
}

// Get all steps
export function getAllSteps(): readonly AEZUIRStep[] {
  return AEZUIR_TWELVE_STEPS;
}
