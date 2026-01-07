import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FullBodySAI } from '@/components/sai/FullBodySAI';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useServiceDog } from '@/contexts/ServiceDogContext';
import { useSAI } from '@/contexts/SAIContext';
import { useSAINarrator } from '@/contexts/SAINarratorContext';
import { useSAIDailyEngine } from '@/contexts/SAIDailyEngineContext';
import { MorningCheckIn } from '@/components/checkin/MorningCheckIn';
import { EveningCheckIn } from '@/components/checkin/EveningCheckIn';
import { DailyTaskList } from '@/components/checkin/DailyTaskList';
import { 
  UtensilsCrossed, 
  Droplets, 
  TreePine, 
  Heart,
  Volume2,
  VolumeX,
  Settings,
  Home,
  Wrench,
  Waves,
  BookOpen,
  Trees,
  MessageCircle,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import cozyBedroomBg from '@/assets/cozy-bedroom-bg.jpg';

/**
 * SAIHome - Main interactive space with SAI
 * 
 * Features:
 * - Morning and evening check-ins
 * - Daily task management
 * - Voice toggle (text shows when voice off)
 * - Care actions: feed, water, take outside
 * - Navigation menu to different scenes
 */

interface CareAction {
  id: 'food' | 'water' | 'outside';
  label: string;
  icon: typeof UtensilsCrossed;
  needKey: 'food' | 'water' | 'movement';
}

const CARE_ACTIONS: CareAction[] = [
  { id: 'food', label: 'Feed', icon: UtensilsCrossed, needKey: 'food' },
  { id: 'water', label: 'Water', icon: Droplets, needKey: 'water' },
  { id: 'outside', label: 'Outside', icon: TreePine, needKey: 'movement' },
];

// AEZUIR Room System - ONLY these rooms exist
const SCENES = [
  { id: 'bedroom', label: 'Safe Home', icon: Home, route: '/sai-home' },
  { id: 'beach', label: 'Tools', icon: Wrench, route: '/beach' },
  { id: 'cabin', label: 'Log Cabin', icon: BookOpen, route: '/cabin' },
  { id: 'settings', label: 'Settings', icon: Settings, route: '/settings' },
];

const GREETINGS = [
  "I'm here with you.",
  "It's good to see you.",
  "Take your time, I'm not going anywhere.",
  "How are you feeling today?",
  "I'm glad you're here.",
];

export default function SAIHome() {
  const navigate = useNavigate();
  const { speak, isSpeaking, voiceEnabled, setVoiceEnabled, stopSpeaking } = useVoiceSettings();
  const { fulfillNeed, dogState } = useServiceDog();
  const { userProfile } = useSAI();
  const { startListeningWindow, isListening } = useSAINarrator();
  const { 
    needsMorningCheckIn, 
    needsEveningCheckIn, 
    todaysTasks,
    todaysFocus,
    morningCheckInComplete 
  } = useSAIDailyEngine();
  
  const saiName = userProfile?.saiNickname || 'SAI';
  const userName = userProfile?.nickname || 'Friend';
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [lastCareAction, setLastCareAction] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showMorningCheckIn, setShowMorningCheckIn] = useState(false);
  const [showEveningCheckIn, setShowEveningCheckIn] = useState(false);
  const hasGreetedRef = useRef(false);

  // AEZUIR: Mark that user has reached Safe House (enables mic option)
  useEffect(() => {
    localStorage.setItem('sai_reached_safe_house', 'true');
  }, []);

  // Get random greeting
  const getGreeting = useCallback(() => {
    const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    return `${greeting}`;
  }, []);

  // Prompt for check-in on mount if needed
  useEffect(() => {
    if (!isInitialized && !hasGreetedRef.current) {
      hasGreetedRef.current = true;
      
      // Check if we need morning or evening check-in
      if (needsMorningCheckIn) {
        setShowMorningCheckIn(true);
      } else if (needsEveningCheckIn) {
        setShowEveningCheckIn(true);
      } else {
        const greeting = getGreeting();
        setCurrentMessage(greeting);
        if (voiceEnabled) {
          speak(greeting);
        }
      }
      
      setTimeout(() => setIsInitialized(true), 500);
    }
  }, [isInitialized, voiceEnabled, speak, getGreeting, needsMorningCheckIn, needsEveningCheckIn]);

  // Handle care action with consent-based language
  const handleCareAction = useCallback(async (action: CareAction) => {
    fulfillNeed(action.needKey);
    
    // Consent-based, gentle responses
    const gentleResponses: Record<string, string[]> = {
      food: [
        `If you'd like, we can think about nourishment together.`,
        `Eating can be hard sometimes. No pressure here.`,
        `When you're ready, we can talk about food in a way that feels manageable.`,
      ],
      water: [
        `Hydration can help. No pressure, just a gentle reminder.`,
        `Water is here when you're ready.`,
      ],
      outside: [
        `If your body feels ready, fresh air can help. Only if it feels right.`,
        `Movement is here when you want it. No rush.`,
      ],
    };
    
    const responses = gentleResponses[action.id];
    const message = responses[Math.floor(Math.random() * responses.length)];
    setCurrentMessage(message);
    setLastCareAction(action.id);
    
    if (voiceEnabled) {
      await speak(message);
    }
    
    // Clear action highlight after a moment
    setTimeout(() => setLastCareAction(null), 2000);
  }, [fulfillNeed, voiceEnabled, speak]);

  // Toggle voice on/off
  const handleVoiceToggle = useCallback(() => {
    if (voiceEnabled) {
      stopSpeaking();
    }
    setVoiceEnabled(!voiceEnabled);
    
    const message = !voiceEnabled 
      ? "Voice enabled. I'll speak to you now."
      : "Voice disabled. My words will appear here instead.";
    setCurrentMessage(message);
    
    if (!voiceEnabled) {
      // Will speak since we're enabling
      setTimeout(() => speak(message), 100);
    }
  }, [voiceEnabled, setVoiceEnabled, stopSpeaking, speak]);

  // Navigate to chat
  const handleTalkToSAI = useCallback(() => {
    navigate('/chat');
  }, [navigate]);

  // Navigate to a scene
  const handleSceneNavigate = (route: string) => {
    setShowMenu(false);
    if (route.startsWith('/')) {
      navigate(route);
    }
  };

  // Handle check-in completion
  const handleMorningCheckInComplete = useCallback(() => {
    setShowMorningCheckIn(false);
    const message = "You've got this. I'm here with you.";
    setCurrentMessage(message);
    if (voiceEnabled) {
      speak(message);
    }
  }, [voiceEnabled, speak]);

  const handleEveningCheckInComplete = useCallback(() => {
    setShowEveningCheckIn(false);
    const message = "Rest well. I'll be here tomorrow.";
    setCurrentMessage(message);
    if (voiceEnabled) {
      speak(message);
    }
  }, [voiceEnabled, speak]);

  // Determine SAI state
  const getSAIState = () => {
    if (isSpeaking) return 'speaking';
    if (isListening) return 'listening';
    return 'attentive';
  };

  // Get time-based indicator
  const getTimeIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) {
      return <Sun className="w-4 h-4 text-amber-500" />;
    }
    return <Moon className="w-4 h-4 text-indigo-400" />;
  };

  return (
    <>
      {/* Check-in Modals */}
      {showMorningCheckIn && (
        <MorningCheckIn onComplete={handleMorningCheckInComplete} />
      )}
      {showEveningCheckIn && (
        <EveningCheckIn onComplete={handleEveningCheckInComplete} />
      )}

      <div 
        className="min-h-screen relative flex flex-col"
        style={{
          backgroundImage: `url(${cozyBedroomBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
      
      {/* Header */}
      <header className="relative z-20 bg-card/30 backdrop-blur-sm border-b border-border/20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              {getTimeIcon()}
            </div>
            <div>
              <span className="font-display font-semibold text-foreground">Safe Home</span>
              {morningCheckInComplete && todaysFocus && (
                <p className="text-xs text-muted-foreground">{todaysFocus.icon} {todaysFocus.label}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Voice Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleVoiceToggle}
              className={cn(
                "text-foreground/70 hover:text-foreground transition-all",
                voiceEnabled && "text-primary"
              )}
            >
              {voiceEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </Button>
            
            {/* Navigation Menu */}
            <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground/70 hover:text-foreground"
                >
                  {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-md border-border shadow-xl z-50">
                <DropdownMenuLabel>Navigate To</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {SCENES.map((scene) => {
                  const Icon = scene.icon;
                  return (
                    <DropdownMenuItem
                      key={scene.id}
                      onClick={() => handleSceneNavigate(scene.route)}
                      className="gap-3 cursor-pointer"
                    >
                      <Icon className="w-4 h-4" />
                      {scene.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-end pb-8 p-4">
        <div className="max-w-lg mx-auto w-full flex flex-col items-center">
          
          {/* SAI Dog - positioned lower to sit on floor */}
          <div className="mb-2">
            <FullBodySAI 
              size="xl" 
              state={getSAIState()}
              showBreathing={!isSpeaking}
            />
          </div>

          {/* Speech Bubble / Text Display */}
          <div className={cn(
            "bg-card/90 backdrop-blur-sm rounded-xl p-5 mb-4 border border-border/50 max-w-md w-full",
            "transition-all duration-300",
            currentMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          )}>
            <p className="text-foreground text-lg leading-relaxed text-center">
              {currentMessage}
              {isSpeaking && <span className="animate-pulse ml-1">|</span>}
            </p>
            {!voiceEnabled && currentMessage && (
              <p className="text-muted-foreground text-xs text-center mt-2">
                (Voice is off - text only)
              </p>
            )}
          </div>

          {/* Talk to SAI Button */}
          <Button
            onClick={handleTalkToSAI}
            size="lg"
            className="h-12 px-6 rounded-2xl text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all mb-4"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Talk to {saiName}
          </Button>

          {/* Daily Tasks (if morning check-in done) */}
          {morningCheckInComplete && todaysTasks.length > 0 && (
            <div className="w-full max-w-xs mb-4">
              <DailyTaskList compact />
            </div>
          )}

          {/* Care Actions */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
            {CARE_ACTIONS.map((action) => {
              const Icon = action.icon;
              const needLevel = dogState.needLevels[action.needKey] || 100;
              const isLow = needLevel < 40;
              const wasJustUsed = lastCareAction === action.id;
              
              return (
                <Button
                  key={action.id}
                  variant={wasJustUsed ? "default" : isLow ? "secondary" : "outline"}
                  size="lg"
                  className={cn(
                    "h-24 flex-col gap-1 transition-all relative",
                    wasJustUsed && "ring-2 ring-primary ring-offset-2",
                    isLow && "animate-pulse"
                  )}
                  onClick={() => handleCareAction(action)}
                  disabled={isSpeaking}
                >
                  <Icon className={cn(
                    "w-6 h-6",
                    wasJustUsed && "text-primary-foreground"
                  )} />
                  <span className="text-xs">{action.label}</span>
                  <span className="text-[10px] text-muted-foreground">Skipping is okay</span>
                  
                  {/* Need indicator */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all",
                        needLevel > 60 ? "bg-progress-stable" : 
                        needLevel > 30 ? "bg-progress-attention" : 
                        "bg-destructive"
                      )}
                      style={{ width: `${needLevel}%` }}
                    />
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Gentle reminder */}
          <p className="text-foreground/40 text-xs mt-4 text-center max-w-xs">
            Take your time. {saiName} is always here.
          </p>
        </div>
      </main>
    </div>
    </>
  );
}
