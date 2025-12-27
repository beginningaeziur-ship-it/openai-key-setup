import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSAI } from '@/contexts/SAIContext';
import { Sparkles, Check, X, Edit3, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { generateGoalsFromProfile } from '@/lib/goalGenerator';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProposedGoal {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: string;
  selected: boolean;
  customized: boolean;
}

export default function GoalProposal() {
  const navigate = useNavigate();
  const { 
    selectedCategories, 
    selectedConditions, 
    selectedSymptoms, 
    whoModel,
    userProfile,
    addGoal,
    completeOnboarding,
    saiPersonality
  } = useSAI();

  const generatedGoals = useMemo(() => {
    return generateGoalsFromProfile(selectedCategories, selectedConditions, selectedSymptoms, whoModel);
  }, [selectedCategories, selectedConditions, selectedSymptoms, whoModel]);

  const suggestedGoals = useMemo(() => {
    return generatedGoals.longTermGoals.map(g => ({
      id: g.id,
      category: g.category,
      title: g.title,
      description: g.description,
      icon: g.icon,
      selected: true,
      customized: false,
    }));
  }, [generatedGoals]);

  const [goals, setGoals] = useState<ProposedGoal[]>(suggestedGoals);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customGoalTitle, setCustomGoalTitle] = useState('');

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => 
      g.id === id ? { ...g, selected: !g.selected } : g
    ));
  };

  const startEditing = (goal: ProposedGoal) => {
    setEditingId(goal.id);
    setEditValue(goal.title);
  };

  const saveEdit = (id: string) => {
    if (editValue.trim()) {
      setGoals(prev => prev.map(g => 
        g.id === id ? { ...g, title: editValue.trim(), customized: true } : g
      ));
    }
    setEditingId(null);
    setEditValue('');
  };

  const addCustomGoal = () => {
    if (customGoalTitle.trim()) {
      const newGoal: ProposedGoal = {
        id: `custom_${Date.now()}`,
        category: 'custom',
        title: customGoalTitle.trim(),
        description: 'Your personal goal',
        icon: '🎯',
        selected: true,
        customized: true,
      };
      setGoals(prev => [...prev, newGoal]);
      setCustomGoalTitle('');
      setShowAddCustom(false);
    }
  };

  const handleComplete = () => {
    const selectedGoalIds = new Set(goals.filter(g => g.selected).map(g => g.id));
    
    goals.filter(g => g.selected).forEach(goal => {
      addGoal({
        type: 'long_term',
        category: goal.category,
        title: goal.title,
        progress: 0,
        targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      });
    });

    generatedGoals.midpointGoals
      .filter(g => g.parentGoalId && selectedGoalIds.has(g.parentGoalId))
      .forEach(goal => {
        addGoal({
          type: 'midpoint',
          category: goal.category,
          title: goal.title,
          progress: 0,
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      });

    const addedMidGoalIds = new Set(
      generatedGoals.midpointGoals
        .filter(g => g.parentGoalId && selectedGoalIds.has(g.parentGoalId))
        .map(g => g.id)
    );

    generatedGoals.microGoals
      .filter(g => g.parentGoalId && addedMidGoalIds.has(g.parentGoalId))
      .slice(0, 5)
      .forEach(goal => {
        addGoal({
          type: 'micro',
          category: goal.category,
          title: goal.title,
          progress: 0,
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
      });
    
    completeOnboarding();
    navigate('/onboarding/water-profile');
  };

  const selectedCount = goals.filter(g => g.selected).length;

  const getSaiMessage = () => {
    if (saiPersonality.sensitivityLevel === 'high') {
      return `Based on what you've shared, here are some gentle goals. There's no pressure — you choose what we focus on.`;
    }
    return `Here's your roadmap. I'll help break each goal into small steps. Accept, adjust, or skip any of these.`;
  };

  return (
    <OnboardingLayout saiMessage={getSaiMessage()} saiState="attentive">
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="space-y-3">
            {goals.map(goal => (
              <div 
                key={goal.id}
                onClick={() => !editingId && toggleGoal(goal.id)}
                className={cn(
                  "bg-black/40 backdrop-blur-md rounded-xl border p-4 cursor-pointer transition-all",
                  goal.selected 
                    ? "border-primary/50 bg-primary/10" 
                    : "border-white/10 opacity-60"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{goal.icon}</span>
                  <div className="flex-1 min-w-0">
                    {editingId === goal.id ? (
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 bg-white/10 border-white/20 text-white"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(goal.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <Button size="sm" onClick={() => saveEdit(goal.id)}>
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white text-sm">{goal.title}</h3>
                          {goal.customized && (
                            <span className="text-xs bg-primary/30 text-primary px-1.5 py-0.5 rounded">
                              edited
                            </span>
                          )}
                        </div>
                        <p className="text-white/60 text-xs mt-0.5">{goal.description}</p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {!editingId && (
                      <button
                        onClick={(e) => { e.stopPropagation(); startEditing(goal); }}
                        className="p-1.5 text-white/50 hover:text-white"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      goal.selected ? "border-primary bg-primary" : "border-white/30"
                    )}>
                      {goal.selected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {showAddCustom ? (
              <div className="bg-black/40 backdrop-blur-md rounded-xl border-2 border-dashed border-primary/30 p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your own goal..."
                    value={customGoalTitle}
                    onChange={(e) => setCustomGoalTitle(e.target.value)}
                    className="flex-1 bg-white/10 border-white/20 text-white"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addCustomGoal();
                      if (e.key === 'Escape') setShowAddCustom(false);
                    }}
                  />
                  <Button onClick={addCustomGoal} disabled={!customGoalTitle.trim()} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" onClick={() => setShowAddCustom(false)} size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full h-10 border-dashed bg-white/5 border-white/20 text-white/70 hover:bg-white/10"
                onClick={() => setShowAddCustom(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add your own goal
              </Button>
            )}
          </div>

          <p className="text-center text-white/50 text-xs mt-4">
            {selectedCount} goal{selectedCount !== 1 ? 's' : ''} selected
          </p>
        </ScrollArea>

        <div className="flex gap-3 pt-4 shrink-0">
          <Button
            variant="outline"
            onClick={() => navigate('/onboarding/preferences')}
            className="flex-1 h-12 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Back
          </Button>
          <Button
            onClick={handleComplete}
            disabled={selectedCount === 0}
            className="flex-1 h-12 rounded-xl"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Start My Journey
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
