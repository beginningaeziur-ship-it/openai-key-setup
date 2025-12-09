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
  const [hasSeenTour, setHasSeenTour] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('sai_seen_room_tour') === 'true';
  });

  const overallProgress = Math.round(
    (progressMetrics.stability + progressMetrics.consistency + 
     progressMetrics.emotionalRegulation + progressMetrics.recoverySpeed) / 4
  );

  const getWelcomeMessage = () => {
    return `Hey ${userName}. This is your space. We move at your pace, not anyone else's.`;
  };

  const handleDismissTour = () => {
    localStorage.setItem('sai_seen_room_tour', 'true');
    setHasSeenTour(true);
  };

  // Scene-specific hotspots for immersive room feel
  const sceneHotspots: Record<SceneType, {
    id: string;
    label: string;
    description: string;
    icon: typeof Wind;
    style: React.CSSProperties;
    onClick: () => void;
  }[]> = {
    bedroom: [
      { id: 'grounding', label: 'Rug', description: 'Sit, breathe, feel the floor', icon: Wind, style: { left: '10%', bottom: '20%' }, onClick: () => setShowGrounding(true) },
      { id: 'tools', label: 'Nightstand', description: 'Daily tools & reminders', icon: Wrench, style: { right: '10%', bottom: '25%' }, onClick: () => navigate('/dashboard') },
      { id: 'goals', label: 'Journal', description: 'Your goals & progress', icon: Target, style: { left: '25%', bottom: '35%' }, onClick: () => navigate('/dashboard') },
      { id: 'research', label: 'Bookshelf', description: 'Info, scripts & advocacy', icon: Search, style: { right: '15%', top: '30%' }, onClick: () => navigate('/chat') },
      { id: 'settings', label: 'Lamp', description: 'How I talk, how much, how fast', icon: Settings, style: { right: '8%', bottom: '45%' }, onClick: () => navigate('/settings') },
    ],
    living_room: [
      { id: 'grounding', label: 'Fireplace', description: 'Warmth and calm', icon: Wind, style: { left: '15%', bottom: '25%' }, onClick: () => setShowGrounding(true) },
      { id: 'tools', label: 'Coffee Table', description: 'Daily tools & reminders', icon: Wrench, style: { right: '20%', bottom: '20%' }, onClick: () => navigate('/dashboard') },
      { id: 'goals', label: 'Notebook', description: 'Your goals & progress', icon: Target, style: { left: '30%', bottom: '30%' }, onClick: () => navigate('/dashboard') },
      { id: 'research', label: 'Books', description: 'Info, scripts & advocacy', icon: Search, style: { right: '10%', top: '35%' }, onClick: () => navigate('/chat') },
      { id: 'settings', label: 'Side Lamp', description: 'How I talk, how much, how fast', icon: Settings, style: { right: '5%', bottom: '40%' }, onClick: () => navigate('/settings') },
    ],
    forest_cabin: [
      { id: 'grounding', label: 'Mossy Rock', description: 'Ground yourself here', icon: Wind, style: { left: '12%', bottom: '18%' }, onClick: () => setShowGrounding(true) },
      { id: 'tools', label: 'Tree Stump', description: 'Daily tools & reminders', icon: Wrench, style: { right: '15%', bottom: '22%' }, onClick: () => navigate('/dashboard') },
      { id: 'goals', label: 'Carved Tree', description: 'Your goals & progress', icon: Target, style: { left: '28%', bottom: '32%' }, onClick: () => navigate('/dashboard') },
      { id: 'research', label: 'Old Oak', description: 'Info, scripts & advocacy', icon: Search, style: { right: '12%', top: '32%' }, onClick: () => navigate('/chat') },
      { id: 'settings', label: 'Lantern', description: 'How I talk, how much, how fast', icon: Settings, style: { right: '6%', bottom: '42%' }, onClick: () => navigate('/settings') },
    ],
    mountain: [
      { id: 'grounding', label: 'Flat Stone', description: 'Sit and breathe', icon: Wind, style: { left: '10%', bottom: '20%' }, onClick: () => setShowGrounding(true) },
      { id: 'tools', label: 'Campsite', description: 'Daily tools & reminders', icon: Wrench, style: { right: '18%', bottom: '24%' }, onClick: () => navigate('/dashboard') },
      { id: 'goals', label: 'Trail Marker', description: 'Your goals & progress', icon: Target, style: { left: '22%', bottom: '36%' }, onClick: () => navigate('/dashboard') },
      { id: 'research', label: 'Lookout', description: 'Info, scripts & advocacy', icon: Search, style: { right: '10%', top: '28%' }, onClick: () => navigate('/chat') },
      { id: 'settings', label: 'Fire Pit', description: 'How I talk, how much, how fast', icon: Settings, style: { right: '8%', bottom: '48%' }, onClick: () => navigate('/settings') },
    ],
    ocean: [
      { id: 'grounding', label: 'Tide Pool', description: 'Feel the rhythm', icon: Wind, style: { left: '8%', bottom: '15%' }, onClick: () => setShowGrounding(true) },
      { id: 'tools', label: 'Driftwood', description: 'Daily tools & reminders', icon: Wrench, style: { right: '12%', bottom: '20%' }, onClick: () => navigate('/dashboard') },
      { id: 'goals', label: 'Sand Drawing', description: 'Your goals & progress', icon: Target, style: { left: '25%', bottom: '28%' }, onClick: () => navigate('/dashboard') },
      { id: 'research', label: 'Lighthouse', description: 'Info, scripts & advocacy', icon: Search, style: { right: '8%', top: '25%' }, onClick: () => navigate('/chat') },
      { id: 'settings', label: 'Beach Lantern', description: 'How I talk, how much, how fast', icon: Settings, style: { right: '5%', bottom: '38%' }, onClick: () => navigate('/settings') },
    ],
    quiet_woods: [
      { id: 'grounding', label: 'Forest Floor', description: 'Feel the earth', icon: Wind, style: { left: '10%', bottom: '18%' }, onClick: () => setShowGrounding(true) },
      { id: 'tools', label: 'Fallen Log', description: 'Daily tools & reminders', icon: Wrench, style: { right: '14%', bottom: '22%' }, onClick: () => navigate('/dashboard') },
      { id: 'goals', label: 'Old Tree', description: 'Your goals & progress', icon: Target, style: { left: '26%', bottom: '34%' }, onClick: () => navigate('/dashboard') },
      { id: 'research', label: 'Clearing', description: 'Info, scripts & advocacy', icon: Search, style: { right: '10%', top: '30%' }, onClick: () => navigate('/chat') },
      { id: 'settings', label: 'Firefly Spot', description: 'How I talk, how much, how fast', icon: Settings, style: { right: '6%', bottom: '44%' }, onClick: () => navigate('/settings') },
    ],
    dim_room: [
      { id: 'grounding', label: 'Cushion', description: 'Soft and quiet', icon: Wind, style: { left: '12%', bottom: '20%' }, onClick: () => setShowGrounding(true) },
      { id: 'tools', label: 'Side Table', description: 'Daily tools & reminders', icon: Wrench, style: { right: '12%', bottom: '24%' }, onClick: () => navigate('/dashboard') },
      { id: 'goals', label: 'Notepad', description: 'Your goals & progress', icon: Target, style: { left: '24%', bottom: '32%' }, onClick: () => navigate('/dashboard') },
      { id: 'research', label: 'Shelf', description: 'Info, scripts & advocacy', icon: Search, style: { right: '10%', top: '28%' }, onClick: () => navigate('/chat') },
      { id: 'settings', label: 'Dim Lamp', description: 'How I talk, how much, how fast', icon: Settings, style: { right: '6%', bottom: '42%' }, onClick: () => navigate('/settings') },
    ],
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
      {/* One-time intro overlay */}
      {!hasSeenTour && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-card border border-border/40 rounded-xl p-5 space-y-4 shadow-lg animate-fade-in">
            <h2 className="text-xl font-semibold">
              Welcome to your space, {userName}.
            </h2>

            <p className="text-sm text-foreground/80">
              This is your SAI room. It's your home base, not a test.
            </p>

            <p className="text-sm text-foreground/70">
              I've started some basic goals for you: stability, health, and daily functioning. 
              They're guideposts, not demands. We can adjust them as I learn how you move through the world.
            </p>

            <p className="text-sm text-foreground/70">
              Around this room there's a Grounding corner, Tools, Goals, a Research area, and Settings. 
              Each one is here to support your disabilities, trauma, and life load without judging you or running your life.
            </p>

            <p className="text-sm text-foreground/70">
              You stay in control. I'll stay steady and adapt to you.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleDismissTour}>
                Skip
              </Button>
              <Button onClick={handleDismissTour}>
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Scene hotspots overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {(sceneHotspots[scene] || []).map(hotspot => (
          <div
            key={hotspot.id}
            style={hotspot.style}
            className="absolute pointer-events-auto"
          >
            <RoomArea
              id={hotspot.id}
              label={hotspot.label}
              description={hotspot.description}
              icon={hotspot.icon}
              iconBgColor="bg-card/60"
              isActive={activeView === hotspot.id}
              onClick={hotspot.onClick}
              className="bg-card/80 border border-border/40 shadow-lg backdrop-blur-sm"
            />
          </div>
        ))}
      </div>

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
