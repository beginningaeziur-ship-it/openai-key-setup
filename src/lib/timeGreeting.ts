/**
 * Time-aware greeting used by the SAI home screen.
 * Returns a greeting plus one soft check-in question.
 */

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface TimeGreeting {
  timeOfDay: TimeOfDay;
  greeting: string;
  checkInQuestion: string;
}

export function getTimeOfDay(date: Date = new Date()): TimeGreeting {
  const h = date.getHours();

  if (h >= 5 && h < 12) {
    return {
      timeOfDay: "morning",
      greeting: "Morning. Let's start easy.",
      checkInQuestion: "No rush. What's one small thing you need first?",
    };
  }
  if (h >= 12 && h < 17) {
    return {
      timeOfDay: "afternoon",
      greeting: "Afternoon check-in.",
      checkInQuestion: "How is the day sitting with you so far?",
    };
  }
  if (h >= 17 && h < 22) {
    return {
      timeOfDay: "evening",
      greeting: "You made it through today.",
      checkInQuestion: "Want to wind down, or talk something through?",
    };
  }
  return {
    timeOfDay: "night",
    greeting: "Still here. That's enough.",
    checkInQuestion: "Nothing has to happen tonight. Want company?",
  };
}
