import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { OnboardingProgress } from '@/components/sai/OnboardingProgress';
import { useSAI } from '@/contexts/SAIContext';
import { ArrowLeft, Sparkles, Target, Check, X, Edit3, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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

  // Generate personalized goals based on user profile
  const suggestedGoals = useMemo(() => {
    const goals: ProposedGoal[] = [];
    
    // Stability goal - for everyone, but especially trauma/addiction
    const hasTrauma = selectedCategories.some(c => 
      ['mental_health', 'authority_trauma', 'self_harm'].includes(c)
    );
    const hasAddiction = selectedCategories.some(c => 
      ['substance_addiction', 'behavioral_addiction', 'eating_disorder'].includes(c)
    );
    
    goals.push({
      id: 'stability',
      category: 'stability',
      title: hasTrauma ? 'Build emotional safety day by day' : 'Feel more stable day to day',
      description: hasTrauma 
        ? 'Create grounding routines and safe spaces to manage overwhelming moments'
        : 'Develop consistent rhythms that help you feel more in control',
      icon: '🌿',
      selected: true,
      customized: false,
    });

    // Housing/Safety goal - for environmental hardship
    const hasHousingIssues = selectedCategories.includes('environmental_hardship') ||
      whoModel?.environmentalBarriers.some(b => 
        ['homelessness', 'unsafe_relationships', 'domestic_violence'].includes(b)
      );
    
    if (hasHousingIssues) {
      goals.push({
        id: 'housing',
        category: 'safety',
        title: 'Work toward safer or more secure housing',
        description: 'Take steps to improve your living situation, whether finding resources, building stability, or planning next moves',
        icon: '🏠',
        selected: true,
        customized: false,
      });
    }

    // Health goal - for chronic illness, medical instability
    const hasHealthConditions = selectedCategories.some(c => 
      ['chronic_illness', 'neurological', 'physical'].includes(c)
    ) || selectedSymptoms.some(s => s.symptoms.includes('medical_instability'));
    
    if (hasHealthConditions) {
      goals.push({
        id: 'health',
        category: 'health',
        title: 'Manage health and symptoms more effectively',
        description: 'Build routines and awareness to better handle your physical health needs',
        icon: '💊',
        selected: true,
        customized: false,
      });
    }

    // Trauma regulation goal - for PTSD/CPTSD/mental health
    if (hasTrauma || selectedConditions.some(c => 
      c.conditions.some(cond => ['ptsd', 'cptsd', 'anxiety', 'panic_disorder', 'dissociative'].includes(cond))
    )) {
      goals.push({
        id: 'regulation',
        category: 'emotional',
        title: 'Develop better emotional regulation tools',
        description: 'Learn and practice techniques to manage triggers, flashbacks, and overwhelming emotions',
        icon: '🧘',
        selected: true,
        customized: false,
      });
    }

    // Addiction support goal
    if (hasAddiction) {
      const addictionType = selectedCategories.includes('eating_disorder') 
        ? 'eating patterns'
        : selectedCategories.includes('behavioral_addiction')
          ? 'behavioral patterns'
          : 'substance use';
      
      goals.push({
        id: 'addiction',
        category: 'recovery',
        title: `Build sustainable recovery from ${addictionType}`,
        description: 'Create harm-reduction strategies, identify triggers, and develop healthier coping options',
        icon: '🌱',
        selected: true,
        customized: false,
      });
    }

    // Daily functioning goal - for executive dysfunction, developmental
    const hasFunctioningIssues = selectedCategories.some(c => 
      ['developmental'].includes(c)
    ) || selectedSymptoms.some(s => 
      s.symptoms.some(sym => ['executive_dysfunction', 'memory_problems'].includes(sym))
    ) || whoModel?.activityLimitations.some(l => 
      ['organizing', 'starting_tasks', 'completing_tasks', 'appointments'].includes(l)
    );
    
    if (hasFunctioningIssues) {
      goals.push({
        id: 'functioning',
        category: 'daily_life',
        title: 'Build routines that don\'t crush your energy',
        description: 'Create sustainable systems for daily tasks that work with your brain, not against it',
        icon: '📋',
        selected: true,
        customized: false,
      });
    }

    // Justice/Re-entry navigation - for authority trauma
    const hasJusticeInvolvement = selectedCategories.includes('authority_trauma') ||
      selectedConditions.some(c => 
        c.conditions.some(cond => ['criminal_justice', 'probation_stress', 'reentry'].includes(cond))
      ) || whoModel?.participationRestrictions.some(r => 
        ['parole'].includes(r)
      );
    
    if (hasJusticeInvolvement) {
      goals.push({
        id: 'reentry',
        category: 'navigation',
        title: 'Navigate justice system requirements',
        description: 'Manage appointments, requirements, and re-entry challenges without overwhelm',
        icon: '⚖️',
        selected: true,
        customized: false,
      });
    }

    // Ensure we have at least 2 goals
    if (goals.length < 2) {
      goals.push({
        id: 'wellbeing',
        category: 'wellbeing',
        title: 'Improve overall wellbeing',
        description: 'Take small, consistent steps toward feeling better in mind and body',
        icon: '✨',
        selected: true,
        customized: false,
      });
    }

    return goals.slice(0, 4); // Max 4 goals
  }, [selectedCategories, selectedConditions, selectedSymptoms, whoModel]);

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
    // Add selected goals to the SAI context
    goals.filter(g => g.selected).forEach(goal => {
      addGoal({
        type: 'long_term',
        category: goal.category,
        title: goal.title,
        progress: 0,
        targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months
      });
    });
    
    completeOnboarding();
    navigate('/sai-room');
  };

  const selectedCount = goals.filter(g => g.selected).length;
  const saiName = userProfile?.saiNickname || 'SAI';

  // Personalized intro based on SAI personality
  const getIntroText = () => {
    if (saiPersonality.sensitivityLevel === 'high') {
      return `Based on what you've shared, I've put together some gentle goals we can work toward over the next 3-6 months. There's no pressure — you're in control of what we focus on.`;
    }
    if (saiPersonality.goalComfort === 'tiny') {
      return `Here are some goals I've tailored for you. We'll break these into tiny, manageable pieces — nothing overwhelming. Accept what feels right, skip what doesn't.`;
    }
    return `Based on your profile, here's what I'd suggest we focus on over the next 3-6 months. You can accept, adjust, or skip any of these.`;
  };

  return (
    <div className="min-h-screen bg-gradient-calm p-6">
      <div className="max-w-2xl mx-auto">
        <OnboardingProgress currentStep={8} totalSteps={8} />
        
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Target className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-display font-bold text-foreground">
                Your Roadmap
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              {getIntroText()}
            </p>
          </div>

          {/* SAI Message Card */}
          <Card className="p-4 bg-sai-lavender/30 border-sai-lavender-dark/30">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{saiName}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  I'll help you break each goal into mid-point milestones and micro-steps. 
                  We'll adjust as we go based on what's working for you.
                </p>
              </div>
            </div>
          </Card>

          {/* Goals List */}
          <div className="space-y-3">
            {goals.map(goal => (
              <Card 
                key={goal.id}
                className={cn(
                  "p-4 transition-all duration-200 cursor-pointer",
                  goal.selected 
                    ? "border-primary/50 bg-primary/5" 
                    : "border-border/50 bg-muted/20 opacity-60"
                )}
                onClick={() => !editingId && toggleGoal(goal.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{goal.icon}</div>
                  <div className="flex-1 min-w-0">
                    {editingId === goal.id ? (
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1"
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
                          <h3 className="font-medium text-foreground">
                            {goal.title}
                          </h3>
                          {goal.customized && (
                            <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                              edited
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {goal.description}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {!editingId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(goal);
                        }}
                      >
                        <Edit3 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    )}
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                      goal.selected 
                        ? "border-primary bg-primary" 
                        : "border-muted-foreground/30"
                    )}>
                      {goal.selected && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Add Custom Goal */}
            {showAddCustom ? (
              <Card className="p-4 border-dashed border-2 border-primary/30">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your own goal..."
                    value={customGoalTitle}
                    onChange={(e) => setCustomGoalTitle(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addCustomGoal();
                      if (e.key === 'Escape') setShowAddCustom(false);
                    }}
                  />
                  <Button onClick={addCustomGoal} disabled={!customGoalTitle.trim()}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                  <Button variant="ghost" onClick={() => setShowAddCustom(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ) : (
              <Button
                variant="outline"
                className="w-full h-12 border-dashed"
                onClick={() => setShowAddCustom(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add your own goal
              </Button>
            )}
          </div>

          {/* Selected summary */}
          <div className="text-center text-sm text-muted-foreground">
            {selectedCount} goal{selectedCount !== 1 ? 's' : ''} selected
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/onboarding/scene')}
              className="flex-1 h-12 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleComplete}
              disabled={selectedCount === 0}
              className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start My Journey
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
