import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useSAI } from '@/contexts/SAIContext';
import { FullBodySAI } from '@/components/sai/FullBodySAI';
import { 
  Home, 
  Phone, 
  MapPin, 
  Heart, 
  Shield,
  ExternalLink,
  ChevronLeft,
  Trees,
  Lightbulb,
  Users,
  AlertCircle
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import forestBg from '@/assets/forest-woods-bg.jpg';

/**
 * ForestScene - Resources and crisis support
 * 
 * Purpose: Safe place to access help and resources
 * Features:
 * - Crisis hotlines
 * - Local resource finder
 * - Safety plan quick access
 * - Peer support information
 */

interface Resource {
  id: string;
  name: string;
  description: string;
  phone?: string;
  website?: string;
  type: 'crisis' | 'support' | 'info';
}

const RESOURCES: Resource[] = [
  {
    id: 'suicide-prevention',
    name: '988 Suicide & Crisis Lifeline',
    description: 'Free, confidential support 24/7. Call or text.',
    phone: '988',
    website: 'https://988lifeline.org',
    type: 'crisis',
  },
  {
    id: 'crisis-text',
    name: 'Crisis Text Line',
    description: 'Text HOME to 741741 for free crisis counseling.',
    phone: '741741',
    website: 'https://crisistextline.org',
    type: 'crisis',
  },
  {
    id: 'samhsa',
    name: 'SAMHSA Helpline',
    description: 'Treatment referrals and information 24/7.',
    phone: '1-800-662-4357',
    website: 'https://samhsa.gov',
    type: 'support',
  },
  {
    id: 'nami',
    name: 'NAMI Helpline',
    description: 'Mental health support and resources.',
    phone: '1-800-950-6264',
    website: 'https://nami.org',
    type: 'support',
  },
  {
    id: 'warmlines',
    name: 'Warmlines',
    description: 'Peer support when you need to talk (not crisis).',
    website: 'https://warmline.org',
    type: 'info',
  },
];

const SUPPORT_TIPS = [
  "It's okay to ask for help. That's strength, not weakness.",
  "You don't have to have all the answers right now.",
  "Small steps count. Every one of them.",
  "You've made it through hard days before.",
  "Reaching out is always the right choice.",
];

export default function ForestScene() {
  const navigate = useNavigate();
  const { speak, voiceEnabled, isSpeaking } = useVoiceSettings();
  const { userProfile } = useSAI();
  const userName = userProfile?.nickname || 'Friend';
  
  const [currentMessage, setCurrentMessage] = useState("You found the quiet place. Resources are here when you need them.");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showSafetyPlan, setShowSafetyPlan] = useState(false);

  const sayMessage = useCallback(async (message: string) => {
    setCurrentMessage(message);
    if (voiceEnabled) {
      await speak(message);
    }
  }, [voiceEnabled, speak]);

  const handleResourceClick = useCallback((resource: Resource) => {
    setSelectedResource(resource);
    sayMessage(`${resource.name}. ${resource.description}`);
  }, [sayMessage]);

  const handleCall = useCallback((phone: string) => {
    window.location.href = `tel:${phone}`;
  }, []);

  const handleWebsite = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const getSupportTip = useCallback(() => {
    const tip = SUPPORT_TIPS[Math.floor(Math.random() * SUPPORT_TIPS.length)];
    sayMessage(tip);
  }, [sayMessage]);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'crisis': return AlertCircle;
      case 'support': return Users;
      default: return Lightbulb;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'crisis': return 'text-red-400 border-red-500/30';
      case 'support': return 'text-amber-400 border-amber-500/30';
      default: return 'text-green-400 border-green-500/30';
    }
  };

  return (
    <div 
      className="min-h-screen relative flex flex-col"
      style={{
        backgroundImage: `url(${forestBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/30 via-transparent to-slate-900/40" />
      
      {/* Header */}
      <header className="relative z-20 bg-card/30 backdrop-blur-sm border-b border-border/20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/sai-home')}
              className="text-foreground/70 hover:text-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Trees className="w-5 h-5 text-emerald-400" />
              <span className="font-display font-semibold text-foreground">Forest</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/sai-home')}
            className="text-foreground/70 hover:text-foreground"
          >
            <Home className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col p-4 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full flex flex-col">
          
          {/* SAI with Message */}
          <div className="flex items-start gap-4 mb-6">
            <FullBodySAI 
              size="md" 
              state={isSpeaking ? 'speaking' : 'attentive'}
            />
            <div className={cn(
              "bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/30 flex-1"
            )}>
              <p className="text-foreground text-sm leading-relaxed">
                {currentMessage}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              variant="outline"
              className="h-14 bg-card/50 border-red-500/30 hover:bg-red-500/20"
              onClick={() => handleCall('988')}
            >
              <Phone className="w-4 h-4 mr-2 text-red-400" />
              <span className="text-sm">Call 988</span>
            </Button>
            <Button
              variant="outline"
              className="h-14 bg-card/50 border-emerald-500/30 hover:bg-emerald-500/20"
              onClick={() => setShowSafetyPlan(true)}
            >
              <Shield className="w-4 h-4 mr-2 text-emerald-400" />
              <span className="text-sm">Safety Plan</span>
            </Button>
          </div>

          {/* Resources List */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground/70 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Support Resources
            </h2>
            
            {RESOURCES.map((resource) => {
              const Icon = getResourceIcon(resource.type);
              const colorClass = getResourceColor(resource.type);
              
              return (
                <Card
                  key={resource.id}
                  className={cn(
                    "bg-card/70 backdrop-blur-sm cursor-pointer transition-all hover:bg-card/90",
                    colorClass,
                    selectedResource?.id === resource.id && "ring-1 ring-primary"
                  )}
                  onClick={() => handleResourceClick(resource)}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Icon className={cn("w-4 h-4", colorClass.split(' ')[0])} />
                        {resource.name}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      {resource.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex gap-2">
                    {resource.phone && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCall(resource.phone!);
                        }}
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                    )}
                    {resource.website && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWebsite(resource.website!);
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Website
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Encouragement */}
          <Button
            variant="ghost"
            className="mt-6 text-foreground/50 hover:text-foreground"
            onClick={getSupportTip}
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            A gentle reminder
          </Button>
        </div>
      </main>

      {/* Safety Plan Sheet */}
      <Sheet open={showSafetyPlan} onOpenChange={setShowSafetyPlan}>
        <SheetContent className="bg-card border-border">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Safety Plan
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <p className="text-muted-foreground text-sm">
              Your personal safety plan helps you through difficult moments.
            </p>
            <Button
              className="w-full"
              onClick={() => navigate('/settings')}
            >
              <MapPin className="w-4 h-4 mr-2" />
              View & Edit Safety Plan
            </Button>
            <div className="border-t border-border pt-4">
              <p className="text-sm text-foreground/70 mb-3">Quick reminders:</p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Reach out to someone you trust</li>
                <li>• Use your grounding techniques</li>
                <li>• Go to your safe place</li>
                <li>• Call a crisis line if needed</li>
              </ul>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}