import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSAI } from '@/contexts/SAIContext';
import { Button } from '@/components/ui/button';
import { SceneBackground, SceneType } from '@/components/sai-room/SceneBackground';
import { SAIPresence } from '@/components/sai-room/SAIPresence';
import { BedroomEnvironment } from '@/components/sai-room/BedroomEnvironment';
import { SceneEnvironment } from '@/components/sai-room/SceneEnvironment';
import { GroundingPanel } from '@/components/sai-room/GroundingPanel';
import { RoomArrival } from '@/components/sai-room/RoomArrival';
import { CrisisSafetyPlan } from '@/components/safety/CrisisSafetyPlan';
import { AmbientSoundControl } from '@/components/sai-room/AmbientSoundControl';
import { useAmbientSound } from '@/hooks/useAmbientSound';
import { 
  Settings, 
  MessageCircle,
  Heart,
  Keyboard
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SAIRoom() {
  const navigate = useNavigate();
  const { userProfile, progressMetrics } = useSAI();
  
  const saiName = userProfile?.saiNickname || 'SAI';
  const userName = userProfile?.nickname || 'Friend';
  const scene = (userProfile?.scene as SceneType) || 'bedroom';
  
  const [activeArea, setActiveArea] = useState<string | null>(null);
  const [showGrounding, setShowGrounding] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [roomReady, setRoomReady] = useState(false);

  // Ambient background sounds for the scene
  const { isPlaying, isMuted, toggleMute, play } = useAmbientSound(scene, {
    volume: 0.12,
    enabled: roomReady,
  });

  const overallProgress = Math.round(
    (progressMetrics.stability + progressMetrics.consistency + 
     progressMetrics.emotionalRegulation + progressMetrics.recoverySpeed) / 4
  );

  const getWelcomeMessage = () => {
    return `I'm here, ${userName}.`;
  };

  const handleArrivalComplete = useCallback(() => {
    setRoomReady(true);
  }, []);

  const handleAreaClick = (areaId: string) => {
    setActiveArea(areaId);
    
    switch (areaId) {
      case 'grounding':
        setShowGrounding(true);
        break;
      case 'goals':
      case 'tools':
        navigate('/dashboard');
        break;
      case 'research':
        navigate('/chat');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'comfort':
        setShowGrounding(true);
        break;
      default:
        break;
    }
  };

  return (
    <SceneBackground scene={scene} className={cn(
      "transition-opacity duration-1000",
      roomReady ? 'opacity-100' : 'opacity-70'
    )}>
      {/* Spoken intro + overlay (only first time) */}
      <RoomArrival 
        userName={userName}
        saiName={saiName}
        onComplete={handleArrivalComplete}
      />

      {/* Scene-specific environment with hotspots */}
      {scene === 'bedroom' ? (
        <BedroomEnvironment
          activeArea={activeArea}
          onAreaSelect={handleAreaClick}
          isVisible={roomReady}
        />
      ) : (
        <SceneEnvironment 
          scene={scene}
          activeArea={activeArea}
          handleAreaClick={handleAreaClick}
          isVisible={roomReady}
        />
      )}

      {/* Header - fades in when room ready */}
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
          "flex flex-col items-center gap-4 mb-12",
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

      {/* Grounding Panel */}
      {showGrounding && (
        <GroundingPanel 
          onClose={() => setShowGrounding(false)}
          userName={userName}
        />
      )}
    </SceneBackground>
  );
}
