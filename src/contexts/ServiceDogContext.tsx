// Service Dog Companion Mode - Canine-assisted therapy prompts
import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useEmotionalState } from './EmotionalStateContext';
import { useSelfStart } from './SelfStartContext';

export type DogMood = 'calm' | 'alert' | 'comforting' | 'playful';

interface ServiceDogState {
  name: string;
  mood: DogMood;
  lastInteraction: string | null;
  stressDetected: boolean;
}

interface ServiceDogContextType {
  // Dog state
  dogState: ServiceDogState;
  
  // Mode toggle
  dogModeEnabled: boolean;
  setDogModeEnabled: (enabled: boolean) => void;
  
  // Dog name customization
  setDogName: (name: string) => void;
  
  // Grounding prompts
  getDogGroundingPrompt: () => string;
  getDogCheckInPrompt: () => string;
  getDogCalmingScript: () => string;
  
  // Care reminders
  careReminders: string[];
  
  // Interaction
  petDog: () => void;
  askForHelp: () => void;
}

const STORAGE_KEY = 'sai_service_dog';

const dogGroundingPrompts = {
  calm: [
    "Imagine your service dog is sitting calmly beside you. Feel their warmth against your leg.",
    "Picture your companion dog resting their head on your lap. Breathe with their steady rhythm.",
    "Your dog is here, quiet and present. They don't need you to speak. Just be.",
  ],
  alert: [
    "Your dog has noticed something. They're looking at you with those knowing eyes. What do they see?",
    "Feel your dog's alert presence. They're watching over you. You're not alone.",
    "Your companion is paying attention. Let them guide you back to the present.",
  ],
  comforting: [
    "Your dog senses you need comfort. They lean gently into you. Accept their warmth.",
    "Picture your dog placing a paw on your hand. It's their way of saying 'I'm here.'",
    "Your companion has moved closer. Their breathing is slow and steady. Match it.",
  ],
  playful: [
    "Your dog brings you their favorite toy. Even in hard moments, joy can visit.",
    "Those puppy eyes are asking for a moment of play. What would you do together?",
    "Your companion does that silly head tilt. It's okay to smile.",
  ],
};

const dogCheckInPrompts = [
  "Your dog is checking on you. A gentle nudge. How are you feeling right now?",
  "Those soft eyes are looking up at you. Your companion wants to know how you're doing.",
  "A warm nose touches your hand. Your dog is asking: Are you okay?",
  "Your faithful friend has settled nearby, watching you. They're ready to help if needed.",
];

const dogCalmingScripts = [
  `Close your eyes if that feels safe. 
Imagine your service dog is right beside you. 
Feel their warmth. Their steady breathing. 
They're not worried. They're just here. 
You can borrow their calm for a moment. 
Breathe with them. Slow and steady.`,

  `Picture your dog lying at your feet.
Their weight is grounding. Their presence is certain.
They don't need you to explain anything.
They just want to be near you.
Let that be enough for right now.
You are not alone.`,

  `Your companion places their chin on your knee.
That gentle weight is an anchor.
Dogs don't judge. They just love.
Let their unconditional acceptance wash over you.
You are worthy of this peace.
Breathe in their calm.`,
];

const careReminders = [
  "Time for a water break - you and your companion both need hydration.",
  "Your service dog needs a short walk. Fresh air will help you both.",
  "Feeding time reminder. Taking care of your companion helps ground you.",
  "Give your dog some gentle pets. Physical connection helps both of you.",
  "Training practice time. Routine helps create stability for you both.",
];

const defaultDogState: ServiceDogState = {
  name: 'Buddy',
  mood: 'calm',
  lastInteraction: null,
  stressDetected: false,
};

const ServiceDogContext = createContext<ServiceDogContextType | undefined>(undefined);

export function ServiceDogProvider({ children }: { children: ReactNode }) {
  const { emotionalState } = useEmotionalState();
  const { triggerRoutine } = useSelfStart();
  
  const [dogModeEnabled, setDogModeEnabledState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`${STORAGE_KEY}_enabled`) === 'true';
    } catch {
      return false;
    }
  });

  const [dogState, setDogState] = useState<ServiceDogState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultDogState, ...JSON.parse(saved) } : defaultDogState;
    } catch {
      return defaultDogState;
    }
  });

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dogState));
    localStorage.setItem(`${STORAGE_KEY}_enabled`, String(dogModeEnabled));
  }, [dogState, dogModeEnabled]);

  // Update dog mood based on emotional state
  useEffect(() => {
    if (!dogModeEnabled) return;
    
    if (emotionalState.distressLevel === 'high') {
      setDogState(prev => ({ ...prev, mood: 'comforting', stressDetected: true }));
    } else if (emotionalState.distressLevel === 'medium') {
      setDogState(prev => ({ ...prev, mood: 'alert', stressDetected: false }));
    } else if (emotionalState.needsGrounding) {
      setDogState(prev => ({ ...prev, mood: 'comforting', stressDetected: false }));
    } else {
      setDogState(prev => ({ ...prev, mood: 'calm', stressDetected: false }));
    }
  }, [emotionalState, dogModeEnabled]);

  const setDogModeEnabled = useCallback((enabled: boolean) => {
    setDogModeEnabledState(enabled);
  }, []);

  const setDogName = useCallback((name: string) => {
    setDogState(prev => ({ ...prev, name }));
  }, []);

  const getDogGroundingPrompt = useCallback((): string => {
    const prompts = dogGroundingPrompts[dogState.mood];
    return prompts[Math.floor(Math.random() * prompts.length)]
      .replace(/your (service )?dog|your companion|your friend/gi, dogState.name);
  }, [dogState.mood, dogState.name]);

  const getDogCheckInPrompt = useCallback((): string => {
    const prompt = dogCheckInPrompts[Math.floor(Math.random() * dogCheckInPrompts.length)];
    return prompt.replace(/your (service )?dog|your companion|your friend/gi, dogState.name);
  }, [dogState.name]);

  const getDogCalmingScript = useCallback((): string => {
    const script = dogCalmingScripts[Math.floor(Math.random() * dogCalmingScripts.length)];
    return script.replace(/your (service )?dog|your companion/gi, dogState.name);
  }, [dogState.name]);

  const petDog = useCallback(() => {
    setDogState(prev => ({
      ...prev,
      mood: 'playful',
      lastInteraction: new Date().toISOString(),
    }));
    // Reset to calm after a moment
    setTimeout(() => {
      setDogState(prev => ({ ...prev, mood: 'calm' }));
    }, 5000);
  }, []);

  const askForHelp = useCallback(() => {
    setDogState(prev => ({
      ...prev,
      mood: 'alert',
      lastInteraction: new Date().toISOString(),
    }));
    // Trigger grounding check-in
    triggerRoutine('distress-triggered', getDogCheckInPrompt());
  }, [triggerRoutine, getDogCheckInPrompt]);

  return (
    <ServiceDogContext.Provider value={{
      dogState,
      dogModeEnabled,
      setDogModeEnabled,
      setDogName,
      getDogGroundingPrompt,
      getDogCheckInPrompt,
      getDogCalmingScript,
      careReminders,
      petDog,
      askForHelp,
    }}>
      {children}
    </ServiceDogContext.Provider>
  );
}

export function useServiceDog() {
  const context = useContext(ServiceDogContext);
  if (context === undefined) {
    throw new Error('useServiceDog must be used within a ServiceDogProvider');
  }
  return context;
}
