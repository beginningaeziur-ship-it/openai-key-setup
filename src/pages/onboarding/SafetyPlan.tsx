import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SAIAnchoredLayout } from '@/components/onboarding/SAIAnchoredLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Plus, 
  X, 
  Phone, 
  Heart, 
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CopingStrategy {
  id: string;
  title: string;
  category: 'distraction' | 'soothing' | 'physical' | 'social' | 'mindfulness';
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

interface SafetyPlan {
  warningSignals: string[];
  copingStrategies: CopingStrategy[];
  emergencyContacts: EmergencyContact[];
  reasonsToLive: string[];
}

const categoryLabels: Record<CopingStrategy['category'], string> = {
  distraction: 'Distraction',
  soothing: 'Self-Soothing',
  physical: 'Physical',
  social: 'Social',
  mindfulness: 'Mindfulness',
};

const SafetyPlan: React.FC = () => {
  const navigate = useNavigate();
  
  const [safetyPlan, setSafetyPlan] = useState<SafetyPlan>(() => {
    const saved = localStorage.getItem('sai_safety_plan');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        warningSignals: parsed.warningSignals || [],
        copingStrategies: parsed.copingStrategies || [],
        emergencyContacts: parsed.emergencyContacts || [],
        reasonsToLive: parsed.reasonsToLive || [],
      };
    }
    return {
      warningSignals: [],
      copingStrategies: [],
      emergencyContacts: [],
      reasonsToLive: [],
    };
  });

  const [expandedSection, setExpandedSection] = useState<string | null>('warning');
  
  // Form states
  const [newWarning, setNewWarning] = useState('');
  const [newCoping, setNewCoping] = useState({ title: '', category: 'distraction' as CopingStrategy['category'] });
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });
  const [newReason, setNewReason] = useState('');

  const savePlan = (updated: SafetyPlan) => {
    setSafetyPlan(updated);
    // Merge with any existing data in localStorage
    const existing = localStorage.getItem('sai_safety_plan');
    const existingData = existing ? JSON.parse(existing) : {};
    localStorage.setItem('sai_safety_plan', JSON.stringify({ ...existingData, ...updated }));
  };

  const addWarning = () => {
    if (!newWarning.trim()) return;
    savePlan({
      ...safetyPlan,
      warningSignals: [...safetyPlan.warningSignals, newWarning.trim()],
    });
    setNewWarning('');
    toast.success('Warning signal added');
  };

  const addCoping = () => {
    if (!newCoping.title.trim()) return;
    const strategy: CopingStrategy = {
      id: crypto.randomUUID(),
      title: newCoping.title.trim(),
      category: newCoping.category,
    };
    savePlan({
      ...safetyPlan,
      copingStrategies: [...safetyPlan.copingStrategies, strategy],
    });
    setNewCoping({ title: '', category: 'distraction' });
    toast.success('Coping strategy added');
  };

  const addContact = () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) return;
    const contact: EmergencyContact = {
      id: crypto.randomUUID(),
      ...newContact,
    };
    savePlan({
      ...safetyPlan,
      emergencyContacts: [...safetyPlan.emergencyContacts, contact],
    });
    setNewContact({ name: '', phone: '', relationship: '' });
    toast.success('Contact added');
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

  const removeWarning = (index: number) => {
    savePlan({
      ...safetyPlan,
      warningSignals: safetyPlan.warningSignals.filter((_, i) => i !== index),
    });
  };

  const removeCoping = (id: string) => {
    savePlan({
      ...safetyPlan,
      copingStrategies: safetyPlan.copingStrategies.filter(s => s.id !== id),
    });
  };

  const removeContact = (id: string) => {
    savePlan({
      ...safetyPlan,
      emergencyContacts: safetyPlan.emergencyContacts.filter(c => c.id !== id),
    });
  };

  const removeReason = (index: number) => {
    savePlan({
      ...safetyPlan,
      reasonsToLive: safetyPlan.reasonsToLive.filter((_, i) => i !== index),
    });
  };

  const handleContinue = () => {
    localStorage.setItem('sai_safety_plan_completed', 'true');
    navigate('/sai-room');
  };

  const handleSkip = () => {
    localStorage.setItem('sai_safety_plan_completed', 'true');
    navigate('/sai-room');
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const hasAnyContent = 
    safetyPlan.warningSignals.length > 0 ||
    safetyPlan.copingStrategies.length > 0 ||
    safetyPlan.emergencyContacts.length > 0 ||
    safetyPlan.reasonsToLive.length > 0;

  return (
    <SAIAnchoredLayout
      saiMessage="Let's create a safety plan together. This is your personal toolkit for difficult moments. You can always update it later."
      saiState="attentive"
      overlayStyle="paper"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-stone-800">Your Safety Plan</h2>
        </div>

        {/* Warning Signals Section */}
        <CollapsibleSection
          title="Warning Signals"
          icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
          description="Signs that tell you a crisis might be approaching"
          isExpanded={expandedSection === 'warning'}
          onToggle={() => toggleSection('warning')}
          count={safetyPlan.warningSignals.length}
        >
          <div className="space-y-2">
            {safetyPlan.warningSignals.map((signal, index) => (
              <Badge key={index} className="bg-amber-100 text-amber-800 border-amber-300 gap-1 mr-1">
                {signal}
                <X className="w-3 h-3 cursor-pointer hover:text-red-600" onClick={() => removeWarning(index)} />
              </Badge>
            ))}
            <div className="flex gap-2 mt-2">
              <Input
                value={newWarning}
                onChange={(e) => setNewWarning(e.target.value)}
                placeholder="e.g., Racing thoughts"
                className="bg-white/80 border-stone-300 text-stone-800 placeholder:text-stone-400 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && addWarning()}
              />
              <Button size="sm" onClick={addWarning} className="shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CollapsibleSection>

        {/* Coping Strategies Section */}
        <CollapsibleSection
          title="Coping Strategies"
          icon={<Sparkles className="w-4 h-4 text-purple-600" />}
          description="Things that help when you're struggling"
          isExpanded={expandedSection === 'coping'}
          onToggle={() => toggleSection('coping')}
          count={safetyPlan.copingStrategies.length}
        >
          <div className="space-y-2">
            {safetyPlan.copingStrategies.map((strategy) => (
              <Badge key={strategy.id} className="bg-purple-100 text-purple-800 border-purple-300 gap-1 mr-1">
                {strategy.title}
                <span className="text-xs opacity-70">({categoryLabels[strategy.category]})</span>
                <X className="w-3 h-3 cursor-pointer hover:text-red-600" onClick={() => removeCoping(strategy.id)} />
              </Badge>
            ))}
            <div className="flex gap-2 mt-2">
              <Input
                value={newCoping.title}
                onChange={(e) => setNewCoping({ ...newCoping, title: e.target.value })}
                placeholder="e.g., Go for a walk"
                className="bg-white/80 border-stone-300 text-stone-800 placeholder:text-stone-400 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && addCoping()}
              />
              <Button size="sm" onClick={addCoping} className="shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CollapsibleSection>

        {/* Emergency Contacts Section */}
        <CollapsibleSection
          title="Safe People"
          icon={<Phone className="w-4 h-4 text-emerald-600" />}
          description="People you can reach out to"
          isExpanded={expandedSection === 'contacts'}
          onToggle={() => toggleSection('contacts')}
          count={safetyPlan.emergencyContacts.length}
        >
          <div className="space-y-2">
            {safetyPlan.emergencyContacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between bg-white/60 rounded p-2 text-sm">
                <div>
                  <span className="font-medium text-stone-800">{contact.name}</span>
                  {contact.relationship && (
                    <span className="text-stone-500 ml-1">({contact.relationship})</span>
                  )}
                  <span className="text-stone-600 block">{contact.phone}</span>
                </div>
                <X className="w-4 h-4 text-stone-400 cursor-pointer hover:text-red-600" onClick={() => removeContact(contact.id)} />
              </div>
            ))}
            <div className="space-y-2 mt-2">
              <div className="flex gap-2">
                <Input
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Name"
                  className="bg-white/80 border-stone-300 text-stone-800 placeholder:text-stone-400 text-sm"
                />
                <Input
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="Phone"
                  className="bg-white/80 border-stone-300 text-stone-800 placeholder:text-stone-400 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Input
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  placeholder="Relationship (optional)"
                  className="bg-white/80 border-stone-300 text-stone-800 placeholder:text-stone-400 text-sm flex-1"
                />
                <Button size="sm" onClick={addContact} className="shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Reasons to Keep Going Section */}
        <CollapsibleSection
          title="Reasons to Keep Going"
          icon={<Heart className="w-4 h-4 text-pink-600" />}
          description="Things worth staying for"
          isExpanded={expandedSection === 'reasons'}
          onToggle={() => toggleSection('reasons')}
          count={safetyPlan.reasonsToLive.length}
        >
          <div className="space-y-2">
            {safetyPlan.reasonsToLive.map((reason, index) => (
              <Badge key={index} className="bg-pink-100 text-pink-800 border-pink-300 gap-1 mr-1">
                {reason}
                <X className="w-3 h-3 cursor-pointer hover:text-red-600" onClick={() => removeReason(index)} />
              </Badge>
            ))}
            <div className="flex gap-2 mt-2">
              <Input
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="e.g., My pet, future goals"
                className="bg-white/80 border-stone-300 text-stone-800 placeholder:text-stone-400 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && addReason()}
              />
              <Button size="sm" onClick={addReason} className="shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CollapsibleSection>

        {/* Crisis Resources */}
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
          <p className="font-medium text-red-800 mb-1">24/7 Crisis Resources</p>
          <ul className="text-red-700 space-y-0.5 text-xs">
            <li>• National Suicide Prevention: 988</li>
            <li>• Crisis Text Line: Text HOME to 741741</li>
            <li>• SAMHSA Helpline: 1-800-662-4357</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1 border-stone-400 text-stone-600 hover:bg-stone-100"
          >
            Skip for now
          </Button>
          <Button
            onClick={handleContinue}
            className="flex-1 gap-2"
          >
            {hasAnyContent ? 'Continue' : 'Enter Home-Base'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </SAIAnchoredLayout>
  );
};

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  isExpanded: boolean;
  onToggle: () => void;
  count: number;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  description,
  isExpanded,
  onToggle,
  count,
  children,
}) => {
  return (
    <div className="border border-stone-200 rounded-lg overflow-hidden bg-white/40">
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between p-3 text-left transition-colors",
          isExpanded ? "bg-white/60" : "hover:bg-white/50"
        )}
      >
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <span className="font-medium text-stone-800 text-sm">{title}</span>
            {count > 0 && (
              <span className="ml-2 text-xs bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-stone-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-stone-400" />
        )}
      </button>
      {isExpanded && (
        <div className="p-3 pt-0 border-t border-stone-200">
          <p className="text-xs text-stone-500 mb-3">{description}</p>
          {children}
        </div>
      )}
    </div>
  );
};

export default SafetyPlan;
