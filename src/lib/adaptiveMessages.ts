// Adaptive Message System
// Returns tone-appropriate messages based on user's emotional state and preferences

import type { SAIPersonality, ThreeChoicePreference } from '@/types/sai';
import type { DistressLevel } from '@/contexts/EmotionalStateContext';

type ToneVariant = 'gentle' | 'neutral' | 'direct';

interface MessageVariants {
  gentle: string;
  neutral: string;
  direct: string;
}

// Message dictionary with tone variants
const messages: Record<string, MessageVariants> = {
  // Greetings
  greeting: {
    gentle: "Hey there. I'm glad you're here. Take your time.",
    neutral: "Welcome back. Ready when you are.",
    direct: "Good to see you. Let's get started.",
  },
  
  // Check-ins
  checkIn: {
    gentle: "Just checking in — how are you holding up? No pressure to answer.",
    neutral: "How are you doing right now?",
    direct: "Quick check: How are you?",
  },
  
  // Encouragement
  encouragement: {
    gentle: "You're doing really well. Every small step counts, and I see you trying.",
    neutral: "Good progress. Keep going at your pace.",
    direct: "Nice work. Moving forward.",
  },
  
  // Transitions
  transition: {
    gentle: "We're going to move on now, but only if you're ready. Take a breath first if you need to.",
    neutral: "Let's move to the next part.",
    direct: "Moving on.",
  },
  
  // Grounding prompts
  groundingOffer: {
    gentle: "Would you like to do a quick grounding exercise? It might help settle things.",
    neutral: "Want to try a grounding exercise?",
    direct: "Grounding exercise available if you need it.",
  },
  
  // Slow down responses
  slowDown: {
    gentle: "No problem at all. Let's take it slower. There's absolutely no rush here.",
    neutral: "Got it. Taking it slower.",
    direct: "Slowing down.",
  },
  
  // Support acknowledgment
  supportAcknowledged: {
    gentle: "I hear you. Let's pause and take care of you first. Everything else can wait.",
    neutral: "Understood. Let's focus on support first.",
    direct: "Support mode. What do you need?",
  },
  
  // Goal completion
  goalComplete: {
    gentle: "You did it! I'm so proud of you. That took real effort.",
    neutral: "Goal completed. Well done.",
    direct: "Done. Goal achieved.",
  },
  
  // Error/fallback
  error: {
    gentle: "Something went a bit sideways, but that's okay. Let's try again together.",
    neutral: "Something went wrong. Let's try again.",
    direct: "Error occurred. Retrying.",
  },
  
  // Tour explanations
  tourWelcome: {
    gentle: "Let me show you around. I'll explain each part gently, and you can always ask me to repeat or skip ahead.",
    neutral: "I'll give you a quick tour of this page.",
    direct: "Quick overview of this section.",
  },
  
  // Session start
  sessionStart: {
    gentle: "We're going to work through something together. Remember, you're in control — we can pause or stop anytime.",
    neutral: "Starting a new session. Let's work through this together.",
    direct: "Session starting. Let's go.",
  },
  
  // Session end
  sessionEnd: {
    gentle: "That was good work. Take a moment to breathe. You showed up, and that matters.",
    neutral: "Session complete. Good work today.",
    direct: "Session done. Good job.",
  },
};

// Determine tone based on personality and emotional state
function determineTone(
  personality?: SAIPersonality,
  supportStylePref?: ThreeChoicePreference,
  distressLevel?: DistressLevel
): ToneVariant {
  // High distress always gets gentle tone
  if (distressLevel === 'high') {
    return 'gentle';
  }
  
  // Check user's stated preference first
  if (supportStylePref === 'gentle') {
    return 'gentle';
  }
  if (supportStylePref === 'challenge') {
    return 'direct';
  }
  
  // Fall back to personality-based tone
  if (personality) {
    if (personality.sensitivityLevel === 'high') {
      return 'gentle';
    }
    if (personality.sensitivityLevel === 'low') {
      return 'direct';
    }
  }
  
  return 'neutral';
}

// Main function to get adaptive message
export function getAdaptiveMessage(
  key: string,
  options?: {
    personality?: SAIPersonality;
    supportStylePref?: ThreeChoicePreference;
    distressLevel?: DistressLevel;
    forceTone?: ToneVariant;
  }
): string {
  const messageSet = messages[key];
  
  if (!messageSet) {
    console.warn(`[AdaptiveMessages] No message found for key: ${key}`);
    return '';
  }
  
  // Use forced tone if provided, otherwise determine automatically
  const tone = options?.forceTone || determineTone(
    options?.personality,
    options?.supportStylePref,
    options?.distressLevel
  );
  
  return messageSet[tone];
}

// Hook-friendly version that can be used with contexts
export function createMessageGetter(
  personality?: SAIPersonality,
  supportStylePref?: ThreeChoicePreference,
  distressLevel?: DistressLevel
) {
  return (key: string, forceTone?: ToneVariant) => 
    getAdaptiveMessage(key, {
      personality,
      supportStylePref,
      distressLevel,
      forceTone,
    });
}

// Get all available message keys
export function getMessageKeys(): string[] {
  return Object.keys(messages);
}

// Add a custom message (for runtime additions)
export function addMessage(key: string, variants: MessageVariants): void {
  messages[key] = variants;
}
