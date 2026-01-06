import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSAI } from '@/contexts/SAIContext';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { Button } from '@/components/ui/button';
import { SceneBackground, SceneType } from '@/components/sai-room/SceneBackground';
import { SAIPresence } from '@/components/sai-room/SAIPresence';
import { RoomActionsDropdown } from '@/components/sai-room/RoomActionsDropdown';
import { SAIIntroRoom } from '@/components/sai-room/SAIIntroRoom';
import { SceneSelector } from '@/components/sai-room/SceneSelector';
import { BedroomTour } from '@/components/sai-room/BedroomTour';
import { CrisisSafetyPlan } from '@/components/safety/CrisisSafetyPlan';
import { AmbientSoundControl } from '@/components/sai-room/AmbientSoundControl';
import { DogCarePanel } from '@/components/dog-care/DogCarePanel';
import { useAmbientSound } from '@/hooks/useAmbientSound';
import { FireplacePanel } from '@/components/room-panels/FireplacePanel';
import { LampPanel } from '@/components/room-panels/LampPanel';
import { RugPanel } from '@/components/room-panels/RugPanel';
import { BookshelfPanel } from '@/components/room-panels/BookshelfPanel';
import { CoffeeTablePanel } from '@/components/room-panels/CoffeeTablePanel';
import { BedPanel } from '@/components/room-panels/BedPanel';
import { 
  Settings, 
  MessageCircle,
  Heart,
  Keyboard,
  PawPrint
} from 'lucide-react';
import { cn } from '@/lib/utils';

type RoomPhase = 'intro' | 'scene-select' | 'tutorial' | 'room';

export default function SAIRoom() {
  const navigate = useNavigate();
  const { userProfile, setUserProfile, progressMetrics } = useSAI();
  
  const saiName = userProfile?.saiNickname || 'SAI';
  const userName = userProfile?.nickname || 'Friend';
  const savedScene = (userProfile?.scene as SceneType) || null;
  
  // Determine initial phase based on what's been completed
  const getInitialPhase = (): RoomPhase => {
    const introSeen = localStorage.getItem('sai_intro_completed') === 'true';
    const tutorialSeen = localStorage.getItem('sai_tutorial_completed') === 'true';
    const onboardingComplete = localStorage.getItem('sai_onboarding');
    const isOnboardingDone = onboardingComplete ? JSON.parse(onboardingComplete).completed : false;
    
    // If onboarding is complete and user already selected a scene, skip intro/scene-select
    if (isOnboardingDone && savedScene) {
      if (!tutorialSeen) return 'tutorial';
      return 'room';
    }
    
    if (!introSeen) return 'intro';
    if (!savedScene) return 'scene-select';
    if (!tutorialSeen) return 'tutorial';
    return 'room';
  };

  const [phase, setPhase] = useState<RoomPhase>(getInitialPhase);
  const [scene, setScene] = useState<SceneType>(savedScene || 'bedroom');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [roomReady, setRoomReady] = useState(phase === 'room');
  
  // Panel states
  const [showFireplace, setShowFireplace] = useState(false);
  const [showLamp, setShowLamp] = useState(false);
  const [showRug, setShowRug] = useState(false);
  const [showBookshelf, setShowBookshelf] = useState(false);
  const [showCoffeeTable, setShowCoffeeTable] = useState(false);
  const [showBed, setShowBed] = useState(false);
  const [showDogCare, setShowDogCare] = useState(false);
  
  // Tour state
  const [showTour, setShowTour] = useState(() => {
    return localStorage.getItem('sai_room_tour_completed') !== 'true' && phase === 'room';
  });
  const [tourHighlight, setTourHighlight] = useState<string | null>(null);

  // Ambient background sounds for the scene
  const { isPlaying, isMuted, toggleMute, play } = useAmbientSound(scene, {
    volume: 0.12,
    enabled: phase === 'room' && roomReady,
  });

  const overallProgress = Math.round(
    (progressMetrics.stability + progressMetrics.consistency + 
     progressMetrics.emotionalRegulation + progressMetrics.recoverySpeed) / 4
  );

  const getWelcomeMessage = () => {
    return `I'm here, ${userName}.`;
  };

  const handleIntroComplete = useCallback(() => {
    localStorage.setItem('sai_intro_completed', 'true');
    setPhase('scene-select');
  }, []);

  const handleSceneSelect = useCallback((selectedScene: SceneType) => {
    setScene(selectedScene);
    if (userProfile) {
      setUserProfile({ ...userProfile, scene: selectedScene });
    }
    setPhase('tutorial');
  }, [userProfile, setUserProfile]);

  const handleTutorialComplete = useCallback(() => {
    localStorage.setItem('sai_tutorial_completed', 'true');
    setPhase('room');
    setTimeout(() => setRoomReady(true), 500);
  }, []);

  const handleTutorialSkip = useCallback(() => {
    localStorage.setItem('sai_tutorial_completed', 'true');
    setPhase('room');
    setTimeout(() => setRoomReady(true), 500);
  }, []);

  // Handle dropdown action selection
  const handleActionSelect = (actionId: string) => {
    switch (actionId) {
      // Main area navigation
      case 'forest-resources': 
        // TODO: Navigate to forest resources panel
        setShowBookshelf(true); // Temporary - uses bookshelf for resources
        break;
      case 'cabin-settings': 
        navigate('/settings');
        break;
      case 'beach-tools': 
        setShowRug(true); // Temporary - uses rug for grounding tools
        break;
      // Quick actions
      case 'grounding': setShowRug(true); break;
      case 'comfort': setShowFireplace(true); break;
      case 'rest': setShowBed(true); break;
      case 'tools': setShowCoffeeTable(true); break;
      case 'settings': setShowLamp(true); break;
      default: break;
    }
  };

  const handleTourComplete = useCallback(() => {
    localStorage.setItem('sai_room_tour_completed', 'true');
    setShowTour(false);
    setTourHighlight(null);
  }, []);

  const handleTourSkip = useCallback(() => {
    localStorage.setItem('sai_room_tour_completed', 'true');
    setShowTour(false);
    setTourHighlight(null);
  }, []);

  // Phase: SAI Introduction
  if (phase === 'intro') {
    return (
      <SAIIntroRoom
        saiName={saiName}
        userName={userName}
        onComplete={handleIntroComplete}
      />
    );
  }

  // Phase: Scene Selection
  if (phase === 'scene-select') {
    return (
      <SceneSelector
        saiName={saiName}
        onSelect={handleSceneSelect}
      />
    );
  }

  // Phase: Tutorial
  if (phase === 'tutorial') {
    return (
      <SceneBackground scene={scene}>
        <BedroomTour
          saiName={saiName}
          userName={userName}
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
          onHighlightHotspot={setTourHighlight}
        />
      </SceneBackground>
    );
  }

  // Phase: Main Room
  return (
    <SceneBackground scene={scene} className={cn(
      "transition-opacity duration-1000",
      roomReady ? 'opacity-100' : 'opacity-70'
    )}>
      {/* First-time room tour */}
      {showTour && (
        <BedroomTour
          saiName={saiName}
          userName={userName}
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
          onHighlightHotspot={setTourHighlight}
        />
      )}

      {/* Header */}
      <header className={cn(
        "bg-card/30 backdrop-blur-sm border-b border-border/20 sticky top-0 z-20",
        "transition-all duration-1000",
        roomReady ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      )}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center sai-breathe">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-semibold">SAI Room</span>
          </div>
          
          <div className="flex items-center gap-2">
            <CrisisSafetyPlan />
            <AmbientSoundControl
              isPlaying={isPlaying}
              isMuted={isMuted}
              onToggleMute={toggleMute}
              onPlay={play}
            />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/settings')}
              className="text-foreground/70 hover:text-foreground"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className={cn(
        "max-w-4xl mx-auto px-4 py-8",
        "transition-all duration-1000 delay-300",
        roomReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}>
        {/* SAI Presence - Center of the room */}
        <div className="flex flex-col items-center mb-12">
          <SAIPresence 
            saiName={saiName}
            message={getWelcomeMessage()}
          />
        </div>

        {/* Talk Area - Primary CTA */}
        <div className={cn(
          "flex flex-col items-center gap-4 mb-8",
          "transition-all duration-700 delay-500",
          roomReady ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}>
          <Button
            onClick={() => navigate('/chat')}
            size="lg"
            className="h-14 px-8 rounded-2xl text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all animate-gentle-glow"
          >
            <MessageCircle className="w-6 h-6 mr-3" />
            Talk to {saiName}
          </Button>
          
          {/* Room Actions Dropdown - Single button */}
          <RoomActionsDropdown 
            scene={scene} 
            onActionSelect={handleActionSelect}
          />
          
          {/* Dog Care Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDogCare(true)}
            className="gap-2"
          >
            <PawPrint className="w-4 h-4" />
            Care for {saiName}
          </Button>
          
          {/* Keyboard toggle */}
          <button
            onClick={() => setShowKeyboard(!showKeyboard)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Keyboard className="w-4 h-4" />
            {showKeyboard ? 'Hide keyboard' : 'Prefer typing?'}
          </button>
        </div>

        {/* Quick stats footer */}
        <div className={cn(
          "mt-12 flex justify-center",
          "transition-all duration-1000 delay-1000",
          roomReady ? 'opacity-100' : 'opacity-0'
        )}>
          <div className="flex items-center gap-6 text-sm text-foreground/60">
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                overallProgress >= 50 ? 'bg-progress-stable' : 'bg-progress-attention'
              )} />
              <span>Stability: {overallProgress}%</span>
            </div>
          </div>
        </div>
      </main>

      {/* Room Panels */}
      <FireplacePanel
        open={showFireplace}
        onClose={() => setShowFireplace(false)}
        userName={userName}
      />
      
      <LampPanel
        open={showLamp}
        onClose={() => setShowLamp(false)}
      />
      
      <RugPanel
        open={showRug}
        onClose={() => setShowRug(false)}
        userName={userName}
      />
      
      <BookshelfPanel
        open={showBookshelf}
        onClose={() => setShowBookshelf(false)}
      />
      
      <CoffeeTablePanel
        open={showCoffeeTable}
        onClose={() => setShowCoffeeTable(false)}
      />
      
      <BedPanel
        open={showBed}
        onClose={() => setShowBed(false)}
        userName={userName}
      />
      
      {/* Dog Care Panel */}
      <DogCarePanel
        open={showDogCare}
        onClose={() => setShowDogCare(false)}
      />
    </SceneBackground>
  );
}
