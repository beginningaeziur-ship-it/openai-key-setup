import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSAI } from '@/contexts/SAIContext';
import { Button } from '@/components/ui/button';
import { SceneBackground, SceneType } from '@/components/sai-room/SceneBackground';
import { SAIPresence } from '@/components/sai-room/SAIPresence';
import { RoomArea } from '@/components/sai-room/RoomArea';
import { GroundingPanel } from '@/components/sai-room/GroundingPanel';
import { CrisisSafetyPlan } from '@/components/safety/CrisisSafetyPlan';
import { 
  Wind, 
  Wrench, 
  Target, 
  Search, 
  Settings, 
  MessageCircle,
  Heart,
  Eye,
  Keyboard
} from 'lucide-react';
import { cn } from '@/lib/utils';

type RoomView = 'home' | 'grounding' | 'tools' | 'goals' | 'research' | 'settings';

export default function SAIRoom() {
  const navigate = useNavigate();
  const { userProfile, progressMetrics, goals } = useSAI();
  
  const saiName = userProfile?.saiNickname || 'SAI';
  const userName = userProfile?.nickname || 'Friend';
  const scene = (userProfile?.scene as SceneType) || 'bedroom';
  
  const [activeView, setActiveView] = useState<RoomView>('home');
  const [showGrounding, setShowGrounding] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);

  const overallProgress = Math.round(
    (progressMetrics.stability + progressMetrics.consistency + 
     progressMetrics.emotionalRegulation + progressMetrics.recoverySpeed) / 4
  );

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning, ${userName}. I'm here whenever you're ready.`;
    if (hour < 17) return `Good afternoon, ${userName}. How are you feeling?`;
    if (hour < 21) return `Good evening, ${userName}. Take your time.`;
    return `Hey ${userName}. I'm here with you tonight.`;
  };

  const roomAreas = [
    {
      id: 'grounding',
      label: 'Grounding Corner',
      description: 'Breathing, sensing, calming',
      icon: Wind,
      iconBgColor: 'bg-sai-calm/20',
      onClick: () => setShowGrounding(true),
    },
    {
      id: 'tools',
      label: 'Support Tools',
      description: 'Routines, check-ins, habits',
      icon: Wrench,
      iconBgColor: 'bg-sai-hope/20',
      onClick: () => navigate('/dashboard'),
    },
    {
      id: 'goals',
      label: 'Stability Wall',
      description: `${goals.length} goals · ${overallProgress}% progress`,
      icon: Target,
      iconBgColor: 'bg-progress-stable/20',
      onClick: () => navigate('/dashboard'),
    },
    {
      id: 'research',
      label: 'Research Desk',
      description: 'Find resources, learn',
      icon: Search,
      iconBgColor: 'bg-sai-gentle/20',
      onClick: () => navigate('/chat'),
    },
    {
      id: 'settings',
      label: 'Settings Alcove',
      description: 'Voice, pacing, preferences',
      icon: Settings,
      iconBgColor: 'bg-muted',
      onClick: () => navigate('/settings'),
    },
    {
      id: 'watcher',
      label: 'Professional View',
      description: 'For your care team',
      icon: Eye,
      iconBgColor: 'bg-secondary/30',
      onClick: () => navigate('/watcher'),
    },
  ];

  return (
    <SceneBackground scene={scene}>
      {/* Header */}
      <header className="bg-card/30 backdrop-blur-sm border-b border-border/20 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center sai-breathe">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-semibold">SAI Room</span>
          </div>
          
          <div className="flex items-center gap-2">
            <CrisisSafetyPlan />
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* SAI Presence - Center of the room */}
        <div className="flex flex-col items-center mb-12">
          <SAIPresence 
            saiName={saiName}
            message={getWelcomeMessage()}
          />
        </div>

        {/* Talk Area - Primary CTA */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <Button
            onClick={() => navigate('/chat')}
            size="lg"
            className="h-14 px-8 rounded-2xl text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
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

        {/* Room Areas Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {roomAreas.map((area) => (
            <RoomArea
              key={area.id}
              id={area.id}
              label={area.label}
              description={area.description}
              icon={area.icon}
              iconBgColor={area.iconBgColor}
              onClick={area.onClick}
              isActive={activeView === area.id}
            />
          ))}
        </div>

        {/* Quick stats footer */}
        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-6 text-sm text-foreground/60">
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                overallProgress >= 50 ? 'bg-progress-stable' : 'bg-progress-attention'
              )} />
              <span>Stability: {overallProgress}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>{goals.length} active goals</span>
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
