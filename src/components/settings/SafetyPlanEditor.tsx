import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Plus, 
  X, 
  Heart,
  AlertTriangle,
  Phone,
  MapPin,
  Sparkles,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SafetyPlanData {
  warningSigns: string[];
  copingStrategies: string[];
  reasonsToLive: string[];
  safePlace: string;
  calmingActivity: string;
  trustedPerson: string;
  emergencyContacts: { name: string; phone: string }[];
}

const STORAGE_KEY = 'sai_safety_plan';

export function SafetyPlanEditor() {
  const { toast } = useToast();
  
  const [plan, setPlan] = useState<SafetyPlanData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      warningSigns: [],
      copingStrategies: [],
      reasonsToLive: [],
      safePlace: '',
      calmingActivity: '',
      trustedPerson: '',
      emergencyContacts: [],
    };
  });
  
  const [newItem, setNewItem] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setHasChanges(true);
  }, [plan]);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    setHasChanges(false);
    toast({
      title: 'Safety plan saved',
      description: 'Your safety plan has been updated.',
    });
  };

  const addToList = (field: 'warningSigns' | 'copingStrategies' | 'reasonsToLive') => {
    const value = newItem[field]?.trim();
    if (!value) return;
    
    setPlan(prev => ({
      ...prev,
      [field]: [...prev[field], value]
    }));
    setNewItem(prev => ({ ...prev, [field]: '' }));
  };

  const removeFromList = (field: 'warningSigns' | 'copingStrategies' | 'reasonsToLive', index: number) => {
    setPlan(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addEmergencyContact = () => {
    const name = newItem.contactName?.trim();
    const phone = newItem.contactPhone?.trim();
    if (!name || !phone) return;
    
    setPlan(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, { name, phone }]
    }));
    setNewItem(prev => ({ ...prev, contactName: '', contactPhone: '' }));
  };

  const removeEmergencyContact = (index: number) => {
    setPlan(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Safety Plan
        </CardTitle>
        <CardDescription>
          Your personal safety plan for difficult moments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Warning Signs */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium">Warning Signs</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Things I notice when I'm starting to struggle
          </p>
          <div className="flex flex-wrap gap-2">
            {plan.warningSigns.map((sign, index) => (
              <Badge key={index} variant="secondary" className="gap-1 pr-1">
                {sign}
                <button 
                  onClick={() => removeFromList('warningSigns', index)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a warning sign..."
              value={newItem.warningSigns || ''}
              onChange={(e) => setNewItem(prev => ({ ...prev, warningSigns: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && addToList('warningSigns')}
              className="flex-1"
            />
            <Button size="icon" variant="outline" onClick={() => addToList('warningSigns')}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Coping Strategies */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium">Coping Strategies</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Things that help me feel better
          </p>
          <div className="flex flex-wrap gap-2">
            {plan.copingStrategies.map((strategy, index) => (
              <Badge key={index} variant="secondary" className="gap-1 pr-1">
                {strategy}
                <button 
                  onClick={() => removeFromList('copingStrategies', index)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a coping strategy..."
              value={newItem.copingStrategies || ''}
              onChange={(e) => setNewItem(prev => ({ ...prev, copingStrategies: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && addToList('copingStrategies')}
              className="flex-1"
            />
            <Button size="icon" variant="outline" onClick={() => addToList('copingStrategies')}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Reasons to Live */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-medium">Reasons to Keep Going</span>
          </div>
          <p className="text-xs text-muted-foreground">
            People, things, or dreams that matter to me
          </p>
          <div className="flex flex-wrap gap-2">
            {plan.reasonsToLive.map((reason, index) => (
              <Badge key={index} variant="secondary" className="gap-1 pr-1">
                {reason}
                <button 
                  onClick={() => removeFromList('reasonsToLive', index)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a reason..."
              value={newItem.reasonsToLive || ''}
              onChange={(e) => setNewItem(prev => ({ ...prev, reasonsToLive: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && addToList('reasonsToLive')}
              className="flex-1"
            />
            <Button size="icon" variant="outline" onClick={() => addToList('reasonsToLive')}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Safe Place */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Safe Place</span>
          </div>
          <Input
            placeholder="Where do you feel safest?"
            value={plan.safePlace}
            onChange={(e) => setPlan(prev => ({ ...prev, safePlace: e.target.value }))}
          />
        </div>

        {/* Calming Activity */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Calming Activity</span>
          <Textarea
            placeholder="Something that helps calm you down..."
            value={plan.calmingActivity}
            onChange={(e) => setPlan(prev => ({ ...prev, calmingActivity: e.target.value }))}
            rows={2}
          />
        </div>

        {/* Trusted Person */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Trusted Person</span>
          <Input
            placeholder="Someone you can reach out to"
            value={plan.trustedPerson}
            onChange={(e) => setPlan(prev => ({ ...prev, trustedPerson: e.target.value }))}
          />
        </div>

        {/* Emergency Contacts */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Emergency Contacts</span>
          </div>
          <div className="space-y-2">
            {plan.emergencyContacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div>
                  <span className="font-medium text-sm">{contact.name}</span>
                  <span className="text-muted-foreground text-sm ml-2">{contact.phone}</span>
                </div>
                <button 
                  onClick={() => removeEmergencyContact(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Name"
              value={newItem.contactName || ''}
              onChange={(e) => setNewItem(prev => ({ ...prev, contactName: e.target.value }))}
            />
            <div className="flex gap-2">
              <Input
                placeholder="Phone"
                value={newItem.contactPhone || ''}
                onChange={(e) => setNewItem(prev => ({ ...prev, contactPhone: e.target.value }))}
              />
              <Button size="icon" variant="outline" onClick={addEmergencyContact}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button 
          className="w-full" 
          onClick={handleSave}
          disabled={!hasChanges}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Safety Plan
        </Button>
      </CardContent>
    </Card>
  );
}
