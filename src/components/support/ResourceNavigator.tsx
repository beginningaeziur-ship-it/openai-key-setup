import React, { useState, useEffect } from 'react';
import { 
  Home, Shield, Phone, Accessibility, Stethoscope, Brain, 
  Heart, Scale, UtensilsCrossed, Car, CreditCard, Dog,
  ChevronRight, MapPin, X, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useSAINarrator } from '@/contexts/SAINarratorContext';
import { useSAI } from '@/contexts/SAIContext';
import { cn } from '@/lib/utils';

interface ResourceCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  color: string;
}

const RESOURCE_CATEGORIES: ResourceCategory[] = [
  { id: 'housing', name: 'Housing & Shelter', icon: Home, description: 'Emergency shelter, housing assistance', color: 'text-blue-500' },
  { id: 'dv', name: 'Domestic Violence Support', icon: Shield, description: 'Safety, escape planning, support', color: 'text-purple-500' },
  { id: 'crisis', name: 'Crisis & 24/7 Help', icon: Phone, description: 'Immediate crisis support', color: 'text-red-500' },
  { id: 'disability', name: 'Disability & ADA Support', icon: Accessibility, description: 'Disability rights, accommodations', color: 'text-indigo-500' },
  { id: 'medical', name: 'Medical & Clinics', icon: Stethoscope, description: 'Healthcare, clinics, prescriptions', color: 'text-green-500' },
  { id: 'mental', name: 'Mental Health Support', icon: Brain, description: 'Counseling, therapy, support groups', color: 'text-teal-500' },
  { id: 'addiction', name: 'Addiction Support', icon: Heart, description: 'Recovery, treatment, meetings', color: 'text-pink-500' },
  { id: 'legal', name: 'Legal Help', icon: Scale, description: 'Legal aid, advocacy, rights', color: 'text-amber-500' },
  { id: 'food', name: 'Food & Survival', icon: UtensilsCrossed, description: 'Food banks, meals, essentials', color: 'text-orange-500' },
  { id: 'transport', name: 'Transportation', icon: Car, description: 'Transit, medical rides, assistance', color: 'text-cyan-500' },
  { id: 'benefits', name: 'Benefits (SNAP, SSI/SSDI)', icon: CreditCard, description: 'Government benefits help', color: 'text-emerald-500' },
  { id: 'service-dog', name: 'Service Dog & Rights', icon: Dog, description: 'Service animal rights, training', color: 'text-yellow-500' },
];

interface ResourceNavigatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResourceNavigator({ open, onOpenChange }: ResourceNavigatorProps) {
  const { narrateScreen, isMuted } = useSAINarrator();
  const { userProfile } = useSAI();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [zipCode, setZipCode] = useState(userProfile?.zipCode || '');
  const [needsZip, setNeedsZip] = useState(false);

  // Narrate when opened
  useEffect(() => {
    if (open && !selectedCategory) {
      narrateScreen('resource-navigator', 
        "This is your Support hub. Here you can find real resources near you: shelter, food, legal help, crisis support, and more. " +
        "Choose a category that matches what you need right now."
      );
    }
  }, [open, selectedCategory, narrateScreen]);

  const handleCategorySelect = (categoryId: string) => {
    const category = RESOURCE_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return;

    // Check if we have ZIP
    if (!zipCode || zipCode.length < 5) {
      setNeedsZip(true);
      narrateScreen('need-zip', 
        "I need your ZIP code to find nearby help. I only use this to locate services near you, not your exact address. " +
        "You can share it now, or skip and add it later in Settings."
      );
      return;
    }

    setSelectedCategory(categoryId);
    narrateScreen(`resource-${categoryId}`,
      `You selected ${category.name}. ${category.description}. ` +
      `I'm looking for resources near ZIP code ${zipCode}. One moment.`
    );
  };

  const handleZipSubmit = () => {
    if (zipCode.length >= 5) {
      setNeedsZip(false);
      // Save to profile
      // userProfile would be updated here
    }
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setNeedsZip(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              {(selectedCategory || needsZip) && (
                <Button variant="ghost" size="icon" onClick={handleBack}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <SheetTitle className="text-xl">
                {needsZip ? 'Your Location' : selectedCategory ? RESOURCE_CATEGORIES.find(c => c.id === selectedCategory)?.name : 'Support Resources'}
              </SheetTitle>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 p-4">
            {/* ZIP Code Request */}
            {needsZip && (
              <div className="space-y-4">
                <p className="text-foreground/80">
                  I only need your ZIP code to find nearby help. Not your full address.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter ZIP code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    className="flex-1"
                    maxLength={5}
                  />
                  <Button onClick={handleZipSubmit} disabled={zipCode.length < 5}>
                    <MapPin className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
                <Button variant="ghost" onClick={() => setNeedsZip(false)} className="w-full">
                  Skip for now
                </Button>
              </div>
            )}

            {/* Category List */}
            {!needsZip && !selectedCategory && (
              <div className="grid gap-2">
                {RESOURCE_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl text-left',
                      'bg-card hover:bg-accent/50 border border-border/50',
                      'transition-all hover:scale-[1.01] active:scale-[0.99]'
                    )}
                  >
                    <div className={cn('p-2 rounded-lg bg-background', category.color)}>
                      <category.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}

            {/* Selected Category Resources */}
            {selectedCategory && !needsZip && (
              <ResourceCategoryView 
                categoryId={selectedCategory} 
                zipCode={zipCode}
              />
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface ResourceCategoryViewProps {
  categoryId: string;
  zipCode: string;
}

function ResourceCategoryView({ categoryId, zipCode }: ResourceCategoryViewProps) {
  const { narrateScreen } = useSAINarrator();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    // Simulate loading resources
    setLoading(true);
    const timer = setTimeout(() => {
      // This would be replaced with actual API calls
      setResources([
        {
          id: '1',
          name: 'Local Community Center',
          description: 'Provides various support services',
          hours: 'Mon-Fri 9am-5pm',
          phone: '(555) 123-4567',
          address: 'Near your ZIP code',
        }
      ]);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [categoryId, zipCode]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 animate-pulse" />
        <p className="text-muted-foreground">Finding resources near you...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Showing resources near ZIP {zipCode}
      </p>
      
      {resources.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No resources found for this category yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            This feature is being expanded. Try 211 for local help.
          </p>
        </div>
      ) : (
        resources.map((resource) => (
          <div key={resource.id} className="p-4 rounded-xl bg-card border border-border/50 space-y-2">
            <h3 className="font-medium text-foreground">{resource.name}</h3>
            <p className="text-sm text-muted-foreground">{resource.description}</p>
            {resource.hours && (
              <p className="text-sm"><strong>Hours:</strong> {resource.hours}</p>
            )}
            {resource.phone && (
              <p className="text-sm"><strong>Phone:</strong> {resource.phone}</p>
            )}
            
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" variant="outline">Save as goal</Button>
              <Button size="sm" variant="outline">Get call script</Button>
              <Button size="sm" variant="outline">Step-by-step plan</Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
