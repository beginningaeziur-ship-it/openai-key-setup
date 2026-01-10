/**
 * ForestScene - Resources Room
 * 
 * AEZUIR Room System:
 * - Resource search by ZIP code
 * - Categorized results (housing, food, legal aid, DV support, medical, disability, crisis)
 * - Offline banner when no internet
 * - Optional saved resources (opt-in only)
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useSAI } from '@/contexts/SAIContext';
import { FullBodySAI } from '@/components/sai/FullBodySAI';
import { persistence } from '@/lib/persistence';
import { isOnline } from '@/lib/offlineMode';
import { 
  Home, 
  ChevronLeft,
  TreePine,
  Search,
  MapPin,
  Phone,
  ExternalLink,
  Heart,
  Building,
  Utensils,
  Scale,
  Shield,
  Stethoscope,
  Users,
  AlertCircle,
  WifiOff,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import forestBg from '@/assets/forest-woods-bg.jpg';

// Resource categories
const RESOURCE_CATEGORIES = [
  { id: 'crisis', label: 'Crisis Lines', icon: AlertCircle, color: 'text-red-400' },
  { id: 'housing', label: 'Housing/Shelter', icon: Building, color: 'text-blue-400' },
  { id: 'food', label: 'Food', icon: Utensils, color: 'text-green-400' },
  { id: 'legal', label: 'Legal Aid', icon: Scale, color: 'text-amber-400' },
  { id: 'dv', label: 'DV Support', icon: Shield, color: 'text-purple-400' },
  { id: 'medical', label: 'Medical', icon: Stethoscope, color: 'text-cyan-400' },
  { id: 'disability', label: 'Disability', icon: Users, color: 'text-pink-400' },
] as const;

// National resources (always available)
interface Resource {
  id: string;
  name: string;
  description: string;
  phone?: string;
  website?: string;
  category: string;
  national: boolean;
}

const NATIONAL_RESOURCES: Resource[] = [
  {
    id: '988',
    name: '988 Suicide & Crisis Lifeline',
    description: 'Free, confidential support 24/7. Call or text.',
    phone: '988',
    website: 'https://988lifeline.org',
    category: 'crisis',
    national: true,
  },
  {
    id: 'crisis-text',
    name: 'Crisis Text Line',
    description: 'Text HOME to 741741 for free crisis counseling.',
    phone: '741741',
    website: 'https://crisistextline.org',
    category: 'crisis',
    national: true,
  },
  {
    id: 'dv-hotline',
    name: 'National DV Hotline',
    description: '24/7 support for domestic violence survivors.',
    phone: '1-800-799-7233',
    website: 'https://thehotline.org',
    category: 'dv',
    national: true,
  },
  {
    id: 'samhsa',
    name: 'SAMHSA Helpline',
    description: 'Treatment referrals and information 24/7.',
    phone: '1-800-662-4357',
    website: 'https://samhsa.gov',
    category: 'medical',
    national: true,
  },
  {
    id: '211',
    name: '211',
    description: 'Connect to local services - housing, food, health, crisis.',
    phone: '211',
    website: 'https://211.org',
    category: 'housing',
    national: true,
  },
  {
    id: 'nami',
    name: 'NAMI Helpline',
    description: 'Mental health support and resources.',
    phone: '1-800-950-6264',
    website: 'https://nami.org',
    category: 'medical',
    national: true,
  },
];

export default function ForestScene() {
  const navigate = useNavigate();
  const { speak, voiceEnabled, isSpeaking } = useVoiceSettings();
  const { userProfile } = useSAI();
  
  const [currentMessage, setCurrentMessage] = useState("The forest holds resources. What do you need?");
  const [zipCode, setZipCode] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [savedResources, setSavedResources] = useState<Resource[]>(() => persistence.getSavedResources() as Resource[]);
  const [online, setOnline] = useState(isOnline());
  
  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const sayMessage = useCallback(async (message: string) => {
    setCurrentMessage(message);
    if (voiceEnabled) {
      await speak(message);
    }
  }, [voiceEnabled, speak]);

  const handleSearch = useCallback(async () => {
    if (!zipCode.trim()) {
      sayMessage("Enter your ZIP code to find local resources.");
      return;
    }
    if (!online) {
      sayMessage("Resource search needs internet. You can still view saved resources and national hotlines.");
      return;
    }
    
    setHasSearched(true);
    // In a real implementation, this would call an API
    sayMessage(`Showing resources near ${zipCode}. National resources are always available.`);
  }, [zipCode, online, sayMessage]);

  const handleCall = useCallback((phone: string) => {
    window.location.href = `tel:${phone}`;
  }, []);

  const handleWebsite = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const toggleSaveResource = useCallback((resource: Resource) => {
    const existing = savedResources.find(r => r.id === resource.id);
    if (existing) {
      const updated = savedResources.filter(r => r.id !== resource.id);
      setSavedResources(updated);
      // Note: We don't persist to localStorage by default per privacy rules
      // User must explicitly opt-in to save
    } else {
      const updated = [...savedResources, resource];
      setSavedResources(updated);
      sayMessage(`${resource.name} saved for quick access.`);
    }
  }, [savedResources, sayMessage]);

  const filteredResources = activeCategory === 'all' 
    ? NATIONAL_RESOURCES 
    : NATIONAL_RESOURCES.filter(r => r.category === activeCategory);

  const getCategoryIcon = (categoryId: string) => {
    const cat = RESOURCE_CATEGORIES.find(c => c.id === categoryId);
    return cat?.icon || Heart;
  };

  const getCategoryColor = (categoryId: string) => {
    const cat = RESOURCE_CATEGORIES.find(c => c.id === categoryId);
    return cat?.color || 'text-foreground';
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
      <div className="absolute inset-0 bg-gradient-to-b from-green-900/30 via-transparent to-green-900/40" />
      
      {/* Offline Banner */}
      {!online && (
        <div className="relative z-30 bg-amber-600/90 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm">
          <WifiOff className="w-4 h-4" />
          Offline mode is active. Resource search needs internet.
        </div>
      )}
      
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
              <TreePine className="w-5 h-5 text-green-400" />
              <span className="font-display font-semibold text-foreground">Resources</span>
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
          
          {/* SAI */}
          <div className="mb-2 flex justify-center">
            <FullBodySAI
              size="md"
              state={isSpeaking ? 'speaking' : 'attentive'}
            />
          </div>

          {/* Message */}
          <div className={cn(
            "bg-card/80 backdrop-blur-sm rounded-xl p-4 mb-4 border border-green-500/30 max-w-md w-full mx-auto"
          )}>
            <p className="text-foreground text-sm leading-relaxed text-center">
              {currentMessage}
            </p>
          </div>

          {/* ZIP Code Search */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Enter ZIP code..."
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 bg-card/70"
                disabled={!online}
              />
            </div>
            <Button onClick={handleSearch} disabled={!online}>
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Category Tabs */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-card/50 backdrop-blur-sm p-1">
              <TabsTrigger value="all" className="text-xs px-2 py-1">All</TabsTrigger>
              {RESOURCE_CATEGORIES.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="text-xs px-2 py-1">
                  <cat.icon className={cn("w-3 h-3 mr-1", cat.color)} />
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeCategory} className="mt-4 space-y-3">
              {filteredResources.map((resource) => {
                const Icon = getCategoryIcon(resource.category);
                const colorClass = getCategoryColor(resource.category);
                const isSaved = savedResources.some(r => r.id === resource.id);
                
                return (
                  <Card
                    key={resource.id}
                    className="bg-card/70 backdrop-blur-sm border-green-500/30 hover:bg-card/90 transition-all"
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Icon className={cn("w-4 h-4", colorClass)} />
                          {resource.name}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleSaveResource(resource)}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4 text-primary" />
                          ) : (
                            <Bookmark className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
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
                          onClick={() => handleCall(resource.phone!)}
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          {resource.phone}
                        </Button>
                      )}
                      {resource.website && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleWebsite(resource.website!)}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Website
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              
              {filteredResources.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No resources in this category yet.</p>
                  <p className="text-xs mt-1">Try calling 211 for local resources.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Saved Resources Reminder */}
          {savedResources.length > 0 && (
            <div className="mt-4 p-3 bg-card/50 rounded-lg border border-green-500/20">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-primary" />
                {savedResources.length} saved resource{savedResources.length > 1 ? 's' : ''} for quick access
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
