import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Plus, 
  X, 
  Phone, 
  Heart, 
  AlertTriangle,
  Sparkles,
  User,
  MessageCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useSAI } from '@/contexts/SAIContext';
import { toast } from 'sonner';

export interface CopingStrategy {
  id: string;
  title: string;
  description: string;
  category: 'distraction' | 'soothing' | 'physical' | 'social' | 'mindfulness';
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isQuickCall?: boolean;
}

export interface SafetyPlan {
  warningSignals: string[];
  copingStrategies: CopingStrategy[];
  emergencyContacts: EmergencyContact[];
  safeEnvironmentSteps: string[];
  reasonsToLive: string[];
  professionalResources: string[];
}

const defaultSafetyPlan: SafetyPlan = {
  warningSignals: [],
  copingStrategies: [],
  emergencyContacts: [],
  safeEnvironmentSteps: [],
  reasonsToLive: [],
  professionalResources: [
    'National Suicide Prevention Lifeline: 988',
    'Crisis Text Line: Text HOME to 741741',
    'SAMHSA Helpline: 1-800-662-4357',
  ],
};

const categoryColors: Record<CopingStrategy['category'], string> = {
  distraction: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  soothing: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  physical: 'bg-green-500/20 text-green-300 border-green-500/30',
  social: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  mindfulness: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
};

const categoryLabels: Record<CopingStrategy['category'], string> = {
  distraction: 'Distraction',
  soothing: 'Self-Soothing',
  physical: 'Physical',
  social: 'Social',
  mindfulness: 'Mindfulness',
};

export function CrisisSafetyPlan() {
  const { userProfile } = useSAI();
  
  const [safetyPlan, setSafetyPlan] = useState<SafetyPlan>(() => {
    const saved = localStorage.getItem('sai_safety_plan');
    return saved ? JSON.parse(saved) : defaultSafetyPlan;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [newWarningSignal, setNewWarningSignal] = useState('');
  const [newSafeStep, setNewSafeStep] = useState('');
  const [newReason, setNewReason] = useState('');
  
  // Coping strategy form
  const [newStrategy, setNewStrategy] = useState({
    title: '',
    description: '',
    category: 'distraction' as CopingStrategy['category'],
  });
  
  // Emergency contact form
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phone: '',
    isQuickCall: false,
  });

  const savePlan = (updatedPlan: SafetyPlan) => {
    setSafetyPlan(updatedPlan);
    localStorage.setItem('sai_safety_plan', JSON.stringify(updatedPlan));
  };

  const addWarningSignal = () => {
    if (!newWarningSignal.trim()) return;
    savePlan({
      ...safetyPlan,
      warningSignals: [...safetyPlan.warningSignals, newWarningSignal.trim()],
    });
    setNewWarningSignal('');
    toast.success('Warning signal added');
  };

  const removeWarningSignal = (index: number) => {
    savePlan({
      ...safetyPlan,
      warningSignals: safetyPlan.warningSignals.filter((_, i) => i !== index),
    });
  };

  const addCopingStrategy = () => {
    if (!newStrategy.title.trim()) return;
    const strategy: CopingStrategy = {
      id: crypto.randomUUID(),
      ...newStrategy,
    };
    savePlan({
      ...safetyPlan,
      copingStrategies: [...safetyPlan.copingStrategies, strategy],
    });
    setNewStrategy({ title: '', description: '', category: 'distraction' });
    toast.success('Coping strategy added');
  };

  const removeCopingStrategy = (id: string) => {
    savePlan({
      ...safetyPlan,
      copingStrategies: safetyPlan.copingStrategies.filter(s => s.id !== id),
    });
  };

  const addEmergencyContact = () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) return;
    const contact: EmergencyContact = {
      id: crypto.randomUUID(),
      ...newContact,
    };
    savePlan({
      ...safetyPlan,
      emergencyContacts: [...safetyPlan.emergencyContacts, contact],
    });
    setNewContact({ name: '', relationship: '', phone: '', isQuickCall: false });
    toast.success('Emergency contact added');
  };

  const removeEmergencyContact = (id: string) => {
    savePlan({
      ...safetyPlan,
      emergencyContacts: safetyPlan.emergencyContacts.filter(c => c.id !== id),
    });
  };

  const addSafeStep = () => {
    if (!newSafeStep.trim()) return;
    savePlan({
      ...safetyPlan,
      safeEnvironmentSteps: [...safetyPlan.safeEnvironmentSteps, newSafeStep.trim()],
    });
    setNewSafeStep('');
    toast.success('Safety step added');
  };

  const removeSafeStep = (index: number) => {
    savePlan({
      ...safetyPlan,
      safeEnvironmentSteps: safetyPlan.safeEnvironmentSteps.filter((_, i) => i !== index),
    });
  };

  const addReason = () => {
    if (!newReason.trim()) return;
    savePlan({
      ...safetyPlan,
      reasonsToLive: [...safetyPlan.reasonsToLive, newReason.trim()],
    });
    setNewReason('');
    toast.success('Reason added');
  };

  const removeReason = (index: number) => {
    savePlan({
      ...safetyPlan,
      reasonsToLive: safetyPlan.reasonsToLive.filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
        >
          <Shield className="w-4 h-4" />
          Safety Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Shield className="w-5 h-5 text-amber-400" />
            Crisis Safety Plan
          </DialogTitle>
          <DialogDescription>
            Your personalized plan for staying safe during difficult moments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Warning Signals */}
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Warning Signals
              </CardTitle>
              <CardDescription className="text-sm">
                Signs that tell you a crisis might be approaching
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {safetyPlan.warningSignals.map((signal, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="bg-amber-500/20 text-amber-300 border border-amber-500/30 gap-1"
                  >
                    {signal}
                    <button onClick={() => removeWarningSignal(index)}>
                      <X className="w-3 h-3 hover:text-destructive" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a warning signal..."
                  value={newWarningSignal}
                  onChange={(e) => setNewWarningSignal(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addWarningSignal()}
                  className="bg-background/50"
                />
                <Button size="sm" onClick={addWarningSignal} variant="secondary">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Coping Strategies */}
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Coping Strategies
              </CardTitle>
              <CardDescription className="text-sm">
                Things that help you feel better during difficult moments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                {safetyPlan.copingStrategies.map((strategy) => (
                  <div 
                    key={strategy.id}
                    className="flex items-start justify-between p-3 rounded-lg bg-background/30 border border-border"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{strategy.title}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${categoryColors[strategy.category]}`}
                        >
                          {categoryLabels[strategy.category]}
                        </Badge>
                      </div>
                      {strategy.description && (
                        <p className="text-sm text-muted-foreground">{strategy.description}</p>
                      )}
                    </div>
                    <button onClick={() => removeCopingStrategy(strategy.id)}>
                      <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 p-3 rounded-lg bg-background/30 border border-dashed border-border">
                <Input
                  placeholder="Strategy name..."
                  value={newStrategy.title}
                  onChange={(e) => setNewStrategy(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-background/50"
                />
                <Textarea
                  placeholder="Description (optional)..."
                  value={newStrategy.description}
                  onChange={(e) => setNewStrategy(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-background/50 min-h-[60px]"
                />
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(categoryLabels) as CopingStrategy['category'][]).map((cat) => (
                    <Button
                      key={cat}
                      size="sm"
                      variant={newStrategy.category === cat ? 'default' : 'outline'}
                      onClick={() => setNewStrategy(prev => ({ ...prev, category: cat }))}
                      className="text-xs"
                    >
                      {categoryLabels[cat]}
                    </Button>
                  ))}
                </div>
                <Button size="sm" onClick={addCopingStrategy} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Strategy
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-400" />
                Emergency Contacts
              </CardTitle>
              <CardDescription className="text-sm">
                People you can reach out to when you need support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                {safetyPlan.emergencyContacts.map((contact) => (
                  <div 
                    key={contact.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{contact.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {contact.relationship} • {contact.phone}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a 
                        href={`tel:${contact.phone}`}
                        className="p-2 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <button onClick={() => removeEmergencyContact(contact.id)}>
                        <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 p-3 rounded-lg bg-background/30 border border-dashed border-border">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Name..."
                    value={newContact.name}
                    onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-background/50"
                  />
                  <Input
                    placeholder="Relationship..."
                    value={newContact.relationship}
                    onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                    className="bg-background/50"
                  />
                </div>
                <Input
                  placeholder="Phone number..."
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-background/50"
                />
                <Button size="sm" onClick={addEmergencyContact} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Safe Environment Steps */}
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                Making My Environment Safe
              </CardTitle>
              <CardDescription className="text-sm">
                Steps to make your surroundings safer during a crisis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {safetyPlan.safeEnvironmentSteps.map((step, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 rounded bg-background/30 border border-border"
                  >
                    <span className="text-sm text-foreground">{index + 1}. {step}</span>
                    <button onClick={() => removeSafeStep(index)}>
                      <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a safety step..."
                  value={newSafeStep}
                  onChange={(e) => setNewSafeStep(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSafeStep()}
                  className="bg-background/50"
                />
                <Button size="sm" onClick={addSafeStep} variant="secondary">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reasons to Live */}
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400" />
                Reasons to Keep Going
              </CardTitle>
              <CardDescription className="text-sm">
                Things, people, or dreams worth holding on for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {safetyPlan.reasonsToLive.map((reason, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="bg-pink-500/20 text-pink-300 border border-pink-500/30 gap-1"
                  >
                    {reason}
                    <button onClick={() => removeReason(index)}>
                      <X className="w-3 h-3 hover:text-destructive" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a reason..."
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addReason()}
                  className="bg-background/50"
                />
                <Button size="sm" onClick={addReason} variant="secondary">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Professional Resources */}
          <Card className="bg-card/50 border-red-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-red-400" />
                Professional Crisis Resources
              </CardTitle>
              <CardDescription className="text-sm">
                Available 24/7 when you need immediate help
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {safetyPlan.professionalResources.map((resource, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded bg-red-500/10 border border-red-500/20 text-sm text-foreground"
                  >
                    {resource}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
