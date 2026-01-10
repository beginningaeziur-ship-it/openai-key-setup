/**
 * AEZUIR NINE STEPS TO SELF-DISCOVERY AND LIFE RECOVERY
 * CANONICAL - DO NOT EDIT
 * 
 * This is universal, NOT addiction-coded.
 * No references to alcoholism, AA, religion, confession, surrender, or moral framing.
 */

export const AEZUIR_NINE_STEPS = [
  {
    number: 1,
    title: "Notice what's happening",
    description: "See patterns in your life without judgment. Just observe.",
  },
  {
    number: 2,
    title: "Protect your identity",
    description: "You are not your struggles. Your identity stays intact through this.",
  },
  {
    number: 3,
    title: "Regulate first",
    description: "Calm your nervous system before making decisions. Stability before insight.",
  },
  {
    number: 4,
    title: "Understand your pattern",
    description: "Trigger → urge → action → relief → aftermath. See the loop clearly.",
  },
  {
    number: 5,
    title: "Identify your real needs",
    description: "What is the behavior trying to give you? Safety? Comfort? Control? Connection?",
  },
  {
    number: 6,
    title: "Choose one small safer step",
    description: "Not a big change. Just one small different choice when you're ready.",
  },
  {
    number: 7,
    title: "Replace, don't punish",
    description: "Find healthier ways to meet the need. No shame, no punishment.",
  },
  {
    number: 8,
    title: "Repair what you can, protect what you must",
    description: "Make amends where safe. Don't re-traumatize yourself or others.",
  },
  {
    number: 9,
    title: "Build your life forward",
    description: "The goal is independence and a life worth living. Not just survival.",
  },
] as const;

export const NINE_STEPS_INTRO = "This is a path you can repeat. You can pause, skip, or go back anytime. If you're overwhelmed, we slow down.";

export const NINE_STEPS_FOOTER = "If you get stuck, go back to step three. Calm first. Always.";

export type AEZUIRNineStep = typeof AEZUIR_NINE_STEPS[number];

// Get step by number
export function getStep(number: number): AEZUIRNineStep | undefined {
  return AEZUIR_NINE_STEPS.find(s => s.number === number);
}

// Get all steps
export function getAllSteps(): readonly AEZUIRNineStep[] {
  return AEZUIR_NINE_STEPS;
}
