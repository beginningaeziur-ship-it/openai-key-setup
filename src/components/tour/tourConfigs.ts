import type { TourConfig } from './GuidedTour';

export const dashboardTour: TourConfig = {
  id: 'dashboard',
  title: 'Dashboard Tour',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Your Dashboard',
      content: "This is your main hub. Here you can see your progress, check in with how you're feeling, and access all the support tools I have for you.",
      voiceText: "This is your main hub. Here you can see your progress, check in with how you're feeling, and access all the support tools I have for you.",
    },
    {
      id: 'progress',
      title: 'Your Progress',
      content: "At the top, you'll see your current goals and how far you've come. We celebrate small wins here — every step counts.",
      voiceText: "At the top, you'll see your current goals and how far you've come. We celebrate small wins here. Every step counts.",
    },
    {
      id: 'checkin',
      title: 'Daily Check-In',
      content: "The check-in button lets you tell me how you're doing today. This helps me adapt my support to what you need right now.",
      voiceText: "The check-in button lets you tell me how you're doing today. This helps me adapt my support to what you need right now.",
    },
    {
      id: 'actions',
      title: 'Quick Actions',
      content: "These buttons give you fast access to grounding exercises, chat, and other tools. Use them whenever you need support.",
      voiceText: "These buttons give you fast access to grounding exercises, chat, and other tools. Use them whenever you need support.",
    },
  ],
};

export const saiRoomTour: TourConfig = {
  id: 'sai-room',
  title: 'SAI Room Tour',
  steps: [
    {
      id: 'welcome',
      title: 'Your Peaceful Space',
      content: "This is your SAI Room — a calm, safe place you can return to whenever you need support. The scene you chose reflects your sense of peace.",
      voiceText: "This is your SAI Room. A calm, safe place you can return to whenever you need support. The scene you chose reflects your sense of peace.",
    },
    {
      id: 'objects',
      title: 'Interactive Objects',
      content: "Notice the objects in your room. Each one does something helpful — like starting a grounding exercise, checking your goals, or adjusting settings. Try tapping them!",
      voiceText: "Notice the objects in your room. Each one does something helpful. Like starting a grounding exercise, checking your goals, or adjusting settings. Try tapping them!",
    },
    {
      id: 'ambient',
      title: 'Ambient Sounds',
      content: "Your room has calming background sounds that match your scene. You can adjust or mute them using the sound controls.",
      voiceText: "Your room has calming background sounds that match your scene. You can adjust or mute them using the sound controls.",
    },
    {
      id: 'presence',
      title: "I'm Here With You",
      content: "I'm always present in this room. You can talk to me anytime by using the microphone or starting a chat. I'm here to listen, not judge.",
      voiceText: "I'm always present in this room. You can talk to me anytime by using the microphone or starting a chat. I'm here to listen, not judge.",
    },
  ],
};

export const chatTour: TourConfig = {
  id: 'chat',
  title: 'Chat Tour',
  steps: [
    {
      id: 'welcome',
      title: 'Talking With Me',
      content: "This is our conversation space. You can type or speak to me here. Everything you share stays between us — your privacy is protected.",
      voiceText: "This is our conversation space. You can type or speak to me here. Everything you share stays between us. Your privacy is protected.",
    },
    {
      id: 'voice',
      title: 'Voice Conversation',
      content: "See the microphone button? You can use it to talk to me with your voice. I'll listen and respond. It's like having a conversation.",
      voiceText: "See the microphone button? You can use it to talk to me with your voice. I'll listen and respond. It's like having a conversation.",
    },
    {
      id: 'support',
      title: 'Adaptive Support',
      content: "I adapt my responses based on what you've told me about yourself. If something feels off, let me know and I'll adjust how I communicate.",
      voiceText: "I adapt my responses based on what you've told me about yourself. If something feels off, let me know and I'll adjust how I communicate.",
    },
  ],
};

export const settingsTour: TourConfig = {
  id: 'settings',
  title: 'Settings Tour',
  steps: [
    {
      id: 'welcome',
      title: 'Your Preferences',
      content: "This is where you can customize how I work with you. Everything here is about making our partnership feel right for you.",
      voiceText: "This is where you can customize how I work with you. Everything here is about making our partnership feel right for you.",
    },
    {
      id: 'voice',
      title: 'Voice Settings',
      content: "Adjust my voice, speaking speed, and volume. You can also control your microphone settings here if you prefer voice conversations.",
      voiceText: "Adjust my voice, speaking speed, and volume. You can also control your microphone settings here if you prefer voice conversations.",
    },
    {
      id: 'emergency',
      title: 'Emergency Contact',
      content: "Your emergency contact is someone who can help in a crisis. I can reach out to them if you're ever in serious distress and want that support.",
      voiceText: "Your emergency contact is someone who can help in a crisis. I can reach out to them if you're ever in serious distress and want that support.",
    },
    {
      id: 'privacy',
      title: 'Your Privacy',
      content: "Your data stays on your device. Professionals only see high-level progress information — never your personal conversations or details.",
      voiceText: "Your data stays on your device. Professionals only see high-level progress information. Never your personal conversations or details.",
    },
  ],
};

export const groundingTour: TourConfig = {
  id: 'grounding',
  title: 'Grounding Exercises Tour',
  steps: [
    {
      id: 'welcome',
      title: 'Grounding Exercises',
      content: "These exercises help you come back to the present moment when you're feeling overwhelmed, anxious, or disconnected.",
      voiceText: "These exercises help you come back to the present moment when you're feeling overwhelmed, anxious, or disconnected.",
    },
    {
      id: 'types',
      title: 'Different Techniques',
      content: "There are several types of grounding — sensory exercises, breathing techniques, and movement-based activities. Try different ones to find what works for you.",
      voiceText: "There are several types of grounding. Sensory exercises, breathing techniques, and movement-based activities. Try different ones to find what works for you.",
    },
    {
      id: 'quick',
      title: 'Quick Access',
      content: "You can access grounding exercises quickly from your SAI Room or Dashboard. In a crisis, these are always just one tap away.",
      voiceText: "You can access grounding exercises quickly from your SAI Room or Dashboard. In a crisis, these are always just one tap away.",
    },
  ],
};

// Map of all available tours
export const tours: Record<string, TourConfig> = {
  dashboard: dashboardTour,
  'sai-room': saiRoomTour,
  chat: chatTour,
  settings: settingsTour,
  grounding: groundingTour,
};

// Get tour by page path
// Note: sai-room tour is now handled by BedroomTour component, not this system
export function getTourForPath(path: string): TourConfig | null {
  if (path === '/dashboard') return dashboardTour;
  // Disabled: sai-room tour is handled inline by BedroomTour component
  // if (path === '/sai-room') return saiRoomTour;
  if (path === '/chat') return chatTour;
  if (path === '/settings') return settingsTour;
  return null;
}
