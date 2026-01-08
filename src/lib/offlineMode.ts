/**
 * AEZUIR Offline Mode - Cy Offline
 * 
 * When no internet, users can still interact with Cy (text-based).
 * Supports: grounding, calm scripts, check-ins, viewing goals/schedule,
 * memos/journals (local only), saved resources.
 */

// Offline detection
export function isOnline(): boolean {
  return navigator.onLine;
}

// Listen for online/offline changes
export function onConnectivityChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// Offline Cy responses - calm, supportive, grounding
export const offlineResponses = {
  greeting: (name: string) => 
    `I'm here, ${name}. We're offline right now, but I'm still with you.`,
  
  grounding: [
    "Let's ground together. Name 5 things you can see right now.",
    "Take a slow breath in... hold... and out. I'm here.",
    "Feel your feet on the floor. You're safe in this moment.",
    "What's one thing you can touch right now? Focus on its texture.",
    "Listen. What's the quietest sound you can hear?",
  ],
  
  calm: [
    "You're doing okay. One breath at a time.",
    "This moment will pass. You've survived before.",
    "It's okay to not be okay right now. I'm still here.",
    "You don't have to fix anything right now. Just breathe.",
    "Rest is allowed. Stillness is enough.",
  ],
  
  encouragement: [
    "You showed up today. That counts.",
    "Small steps are still forward.",
    "You're allowed to take your time.",
    "What you're carrying is heavy. Be gentle with yourself.",
    "Progress isn't a straight line. You're still moving.",
  ],
  
  distress: [
    "I hear that you're struggling. Let's pause together.",
    "That sounds really hard. I'm here with you.",
    "You're not alone in this moment. I'm right here.",
    "We don't have to solve anything. Just be here together.",
    "You reached out. That takes strength. I'm glad you did.",
  ],
  
  offlineNotice: "Offline mode is active. Some features will return when internet is available.",
};

// Get a random response from a category
export function getOfflineResponse(category: keyof typeof offlineResponses): string {
  const responses = offlineResponses[category];
  if (typeof responses === 'function') {
    return responses('Friend');
  }
  if (Array.isArray(responses)) {
    return responses[Math.floor(Math.random() * responses.length)];
  }
  return responses;
}

// Detect if message suggests distress
export function detectDistress(message: string): boolean {
  const distressPatterns = [
    /i('m| am) (not|never) (okay|ok|fine|good)/i,
    /i can'?t (do|take|handle|cope)/i,
    /i('m| am) (failing|worthless|useless)/i,
    /want to (die|hurt|end|give up)/i,
    /i hate (myself|everything|this)/i,
    /nobody (cares|loves|understands)/i,
    /i('m| am) (alone|scared|terrified)/i,
  ];
  
  return distressPatterns.some(pattern => pattern.test(message));
}

// Generate offline response based on message
export function generateOfflineResponse(message: string, userName: string): string {
  const lower = message.toLowerCase();
  
  // Check for distress first
  if (detectDistress(message)) {
    const responses = offlineResponses.distress;
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Check for grounding requests
  if (lower.includes('ground') || lower.includes('panic') || lower.includes('anxious') || lower.includes('anxiety')) {
    const responses = offlineResponses.grounding;
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Check for calm/breathing
  if (lower.includes('calm') || lower.includes('breath') || lower.includes('relax')) {
    const responses = offlineResponses.calm;
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Default - encouragement
  const responses = offlineResponses.encouragement;
  return responses[Math.floor(Math.random() * responses.length)];
}

// 5-4-3-2-1 grounding script (works offline)
export const groundingScript = {
  intro: "Let's do 5-4-3-2-1 grounding together.",
  steps: [
    "Name 5 things you can SEE right now.",
    "Name 4 things you can TOUCH.",
    "Name 3 things you can HEAR.",
    "Name 2 things you can SMELL.",
    "Name 1 thing you can TASTE.",
  ],
  outro: "Good. You're here. You're present. You're safe.",
};

// Box breathing script (works offline)
export const boxBreathingScript = {
  intro: "Let's do box breathing. Follow along.",
  steps: [
    { action: "Breathe IN", duration: 4 },
    { action: "HOLD", duration: 4 },
    { action: "Breathe OUT", duration: 4 },
    { action: "HOLD", duration: 4 },
  ],
  repeat: 4,
  outro: "Well done. How do you feel?",
};
