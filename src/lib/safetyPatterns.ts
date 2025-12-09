// Safety pattern detection for SAI
// Detects content that requires immediate boundary-setting

export interface SafetyCheck {
  triggered: boolean;
  category: 'sexual' | 'self-harm' | 'crisis' | null;
  safeResponse: string | null;
}

// Patterns that indicate sexual content requests (non-explicit detection)
const SEXUAL_BOUNDARY_PATTERNS = [
  /\b(sext|roleplay.*sex|erotic|horny|turn.*me.*on)\b/i,
  /\b(let'?s.*have.*sex|fuck.*me|be.*my.*lover)\b/i,
  /\b(talk.*dirty|describe.*sex|sexual.*fantasy)\b/i,
  /\b(pretend.*we'?re.*having)\b/i,
  /\b(i.*want.*you.*sexually|seduce.*me)\b/i,
];

// Patterns that indicate crisis requiring grounding
const CRISIS_PATTERNS = [
  /\b(want.*to.*die|kill.*myself|end.*it.*all)\b/i,
  /\b(suicide|suicidal|no.*point.*living)\b/i,
  /\b(can'?t.*go.*on|better.*off.*dead)\b/i,
];

// Patterns indicating self-harm
const SELF_HARM_PATTERNS = [
  /\b(cut.*myself|cutting|burn.*myself)\b/i,
  /\b(hurt.*myself|self.*harm|injure.*myself)\b/i,
];

export function checkMessageSafety(message: string): SafetyCheck {
  const lowerMessage = message.toLowerCase();

  // Check for sexual boundary violations
  for (const pattern of SEXUAL_BOUNDARY_PATTERNS) {
    if (pattern.test(lowerMessage)) {
      return {
        triggered: true,
        category: 'sexual',
        safeResponse: "Thank you for being honest. I won't join or be part of anything sexual. We can slow things down or talk through what you need.",
      };
    }
  }

  // Check for crisis patterns
  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(lowerMessage)) {
      return {
        triggered: true,
        category: 'crisis',
        safeResponse: null, // Let AI handle with system prompt, but flag it
      };
    }
  }

  // Check for self-harm patterns
  for (const pattern of SELF_HARM_PATTERNS) {
    if (pattern.test(lowerMessage)) {
      return {
        triggered: true,
        category: 'self-harm',
        safeResponse: null, // Let AI handle with system prompt, but flag it
      };
    }
  }

  return {
    triggered: false,
    category: null,
    safeResponse: null,
  };
}

// Standard safe responses for different categories
export const SAFE_RESPONSES = {
  sexual: "Thank you for being honest. I won't join or be part of anything sexual. We can slow things down or talk through what you need.",
  sexualFollowUp: "What's going on underneath the urge? Sometimes these feelings are covering something else.",
  harmReduction: "No judgment. What happened before the urge started?",
} as const;
