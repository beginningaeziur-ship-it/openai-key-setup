import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useSAI } from '@/contexts/SAIContext';
import { FullBodySAI } from '@/components/sai/FullBodySAI';
import { 
  Home, 
  Wind, 
  BookOpen, 
  Waves, 
  Eye, 
  Ear, 
  Hand,
  Sun,
  Save,
  X,
  ChevronLeft,
  FileText,
  ClipboardList,
  Stethoscope,
  Scale,
  Building,
  Users,
  Plus,
  Trash2
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import oceanBg from '@/assets/tropical-ocean-bg.jpg';

/**
 * BeachScene - Tools Room
 * 
 * AEZUIR Room System:
 * - Grounding tools (5-4-3-2-1, breathing)
 * - Quick memos
 * - Prep lists (doctor, parole, court, housing, caseworker)
 * - Document-gather checklists
 * - Optional journaling (save to device or disappear)
 */

interface GroundingStep {
  count: number;
  sense: string;
  icon: typeof Eye;
  prompt: string;
}

const GROUNDING_STEPS: GroundingStep[] = [
  { count: 5, sense: 'See', icon: Eye, prompt: 'Name 5 things you can see right now.' },
  { count: 4, sense: 'Touch', icon: Hand, prompt: 'Name 4 things you can feel or touch.' },
  { count: 3, sense: 'Hear', icon: Ear, prompt: 'Name 3 things you can hear.' },
  { count: 2, sense: 'Smell', icon: Wind, prompt: 'Name 2 things you can smell.' },
  { count: 1, sense: 'Taste', icon: Sun, prompt: 'Name 1 thing you can taste.' },
];

const MEDITATION_PROMPTS = [
  "Imagine each wave carrying away one worry.",
  "With each breath, feel yourself becoming lighter.",
  "The horizon is steady. You are steady.",
  "The sand holds you. The ground is here.",
  "This moment is enough. You are enough.",
];

interface PrepListType {
  id: string;
  name: string;
  icon: typeof Stethoscope;
  defaultItems: string[];
}

const PREP_LIST_TYPES: PrepListType[] = [
  { 
    id: 'doctor', 
    name: 'Doctor Visit', 
    icon: Stethoscope,
    defaultItems: ['List current medications', 'Write down symptoms to discuss', 'Bring ID and insurance card', 'Questions to ask']
  },
  { 
    id: 'parole', 
    name: 'Parole/Probation', 
    icon: Users,
    defaultItems: ['Bring ID', 'Employment verification', 'Proof of residence', 'Notes on progress']
  },
  { 
    id: 'court', 
    name: 'Court Date', 
    icon: Scale,
    defaultItems: ['Case number', 'Relevant documents', 'Questions for attorney', 'Dress appropriately']
  },
  { 
    id: 'housing', 
    name: 'Housing', 
    icon: Building,
    defaultItems: ['ID documents', 'Proof of income', 'References list', 'Questions about lease']
  },
  { 
    id: 'caseworker', 
    name: 'Caseworker', 
    icon: ClipboardList,
    defaultItems: ['Progress updates', 'Challenges to discuss', 'Resource requests', 'Goal review']
  },
];

interface Memo {
  id: string;
  text: string;
  createdAt: number;
}

interface PrepList {
  id: string;
  type: string;
  items: { text: string; checked: boolean }[];
  notes: string;
  createdAt: number;
}

export default function BeachScene() {
  const navigate = useNavigate();
  const { speak, voiceEnabled, isSpeaking } = useVoiceSettings();
  const { userProfile } = useSAI();
  
  const [currentMessage, setCurrentMessage] = useState("The waves are always here. So am I. This is your tools room.");
  const [activeTab, setActiveTab] = useState<'grounding' | 'memos' | 'prep' | 'journal'>('grounding');
  
  // Grounding state
  const [groundingStep, setGroundingStep] = useState<number | null>(null);
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  
  // Memo state
  const [memos, setMemos] = useState<Memo[]>(() => {
    const saved = localStorage.getItem('sai_memos');
    return saved ? JSON.parse(saved) : [];
  });
  const [newMemo, setNewMemo] = useState('');
  
  // Prep list state
  const [prepLists, setPrepLists] = useState<PrepList[]>(() => {
    const saved = localStorage.getItem('sai_prep_lists');
    return saved ? JSON.parse(saved) : [];
  });
  const [showPrepSheet, setShowPrepSheet] = useState(false);
  const [activePrepList, setActivePrepList] = useState<PrepList | null>(null);
  const [selectedPrepType, setSelectedPrepType] = useState<PrepListType | null>(null);
  
  // Journal state
  const [showJournal, setShowJournal] = useState(false);
  const [journalEntry, setJournalEntry] = useState('');

  // Speak message if voice enabled
  const sayMessage = useCallback(async (message: string) => {
    setCurrentMessage(message);
    if (voiceEnabled) {
      await speak(message);
    }
  }, [voiceEnabled, speak]);

  // === Grounding handlers ===
  const startGrounding = useCallback(async () => {
    setGroundingStep(0);
    await sayMessage("Let's ground together using your senses. Take your time with each one.");
  }, [sayMessage]);

  const nextGroundingStep = useCallback(async () => {
    if (groundingStep === null) return;
    
    if (groundingStep < GROUNDING_STEPS.length - 1) {
      const nextStep = groundingStep + 1;
      setGroundingStep(nextStep);
      await sayMessage(GROUNDING_STEPS[nextStep].prompt);
    } else {
      setGroundingStep(null);
      await sayMessage("You did it. You're here, in this moment. Well done.");
    }
  }, [groundingStep, sayMessage]);

  const startBreathing = useCallback(async () => {
    setBreathPhase('inhale');
    await sayMessage("Breathe with the waves. In... hold... out...");
    
    const cycle = async () => {
      setBreathPhase('inhale');
      await new Promise(r => setTimeout(r, 4000));
      setBreathPhase('hold');
      await new Promise(r => setTimeout(r, 2000));
      setBreathPhase('exhale');
      await new Promise(r => setTimeout(r, 4000));
    };
    
    for (let i = 0; i < 3; i++) {
      await cycle();
    }
    
    setBreathPhase('idle');
    await sayMessage("Three breaths complete. How do you feel?");
  }, [sayMessage]);

  const getMeditation = useCallback(async () => {
    const prompt = MEDITATION_PROMPTS[Math.floor(Math.random() * MEDITATION_PROMPTS.length)];
    await sayMessage(prompt);
  }, [sayMessage]);

  // === Memo handlers ===
  const saveMemos = useCallback((newMemos: Memo[]) => {
    setMemos(newMemos);
    localStorage.setItem('sai_memos', JSON.stringify(newMemos));
  }, []);

  const addMemo = useCallback(() => {
    if (!newMemo.trim()) return;
    const memo: Memo = {
      id: Date.now().toString(),
      text: newMemo.trim(),
      createdAt: Date.now()
    };
    saveMemos([memo, ...memos]);
    setNewMemo('');
    sayMessage("Memo saved.");
  }, [newMemo, memos, saveMemos, sayMessage]);

  const deleteMemo = useCallback((id: string) => {
    saveMemos(memos.filter(m => m.id !== id));
  }, [memos, saveMemos]);

  // === Prep list handlers ===
  const savePrepLists = useCallback((newLists: PrepList[]) => {
    setPrepLists(newLists);
    localStorage.setItem('sai_prep_lists', JSON.stringify(newLists));
  }, []);

  const createPrepList = useCallback((type: PrepListType) => {
    const newList: PrepList = {
      id: Date.now().toString(),
      type: type.id,
      items: type.defaultItems.map(text => ({ text, checked: false })),
      notes: '',
      createdAt: Date.now()
    };
    setActivePrepList(newList);
    setSelectedPrepType(type);
    setShowPrepSheet(true);
  }, []);

  const openPrepList = useCallback((list: PrepList) => {
    setActivePrepList(list);
    const type = PREP_LIST_TYPES.find(t => t.id === list.type);
    setSelectedPrepType(type || null);
    setShowPrepSheet(true);
  }, []);

  const savePrepList = useCallback(() => {
    if (!activePrepList) return;
    const exists = prepLists.find(p => p.id === activePrepList.id);
    if (exists) {
      savePrepLists(prepLists.map(p => p.id === activePrepList.id ? activePrepList : p));
    } else {
      savePrepLists([activePrepList, ...prepLists]);
    }
    setShowPrepSheet(false);
    setActivePrepList(null);
    sayMessage("Prep list saved.");
  }, [activePrepList, prepLists, savePrepLists, sayMessage]);

  const deletePrepList = useCallback((id: string) => {
    savePrepLists(prepLists.filter(p => p.id !== id));
  }, [prepLists, savePrepLists]);

  const togglePrepItem = useCallback((index: number) => {
    if (!activePrepList) return;
    const newItems = [...activePrepList.items];
    newItems[index].checked = !newItems[index].checked;
    setActivePrepList({ ...activePrepList, items: newItems });
  }, [activePrepList]);

  const addPrepItem = useCallback((text: string) => {
    if (!activePrepList || !text.trim()) return;
    setActivePrepList({
      ...activePrepList,
      items: [...activePrepList.items, { text: text.trim(), checked: false }]
    });
  }, [activePrepList]);

  // === Journal handlers ===
  const saveJournal = useCallback(() => {
    if (!journalEntry.trim()) return;
    
    const date = new Date().toLocaleDateString();
    const content = `Journal Entry - ${date}\n\n${journalEntry}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    setJournalEntry('');
    setShowJournal(false);
    sayMessage("Your thoughts are saved. They're yours to keep.");
  }, [journalEntry, sayMessage]);

  const discardJournal = useCallback(() => {
    setJournalEntry('');
    setShowJournal(false);
    sayMessage("Entry discarded. It's gone, never stored.");
  }, [sayMessage]);

  return (
    <div 
      className="min-h-screen relative flex flex-col"
      style={{
        backgroundImage: `url(${oceanBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 via-transparent to-cyan-900/30" />
      
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
              <Waves className="w-5 h-5 text-cyan-400" />
              <span className="font-display font-semibold text-foreground">Tools</span>
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
              showBreathing={breathPhase !== 'idle'}
            />
          </div>

          {/* Message */}
          <div className={cn(
            "bg-card/80 backdrop-blur-sm rounded-xl p-4 mb-4 border border-cyan-500/30 max-w-md w-full mx-auto",
            "transition-all duration-300"
          )}>
            <p className="text-foreground text-sm leading-relaxed text-center">
              {currentMessage}
            </p>
            
            {/* Breathing indicator */}
            {breathPhase !== 'idle' && (
              <div className="mt-4 flex justify-center">
                <div className={cn(
                  "w-16 h-16 rounded-full border-2 border-cyan-400 flex items-center justify-center transition-all duration-1000",
                  breathPhase === 'inhale' && "scale-125 bg-cyan-400/20",
                  breathPhase === 'hold' && "scale-125 bg-cyan-400/30",
                  breathPhase === 'exhale' && "scale-75 bg-transparent"
                )}>
                  <span className="text-sm text-cyan-300 capitalize">{breathPhase}</span>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm">
              <TabsTrigger value="grounding" className="text-xs px-2">
                <Wind className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="memos" className="text-xs px-2">
                <FileText className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="prep" className="text-xs px-2">
                <ClipboardList className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="journal" className="text-xs px-2">
                <BookOpen className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>

            {/* GROUNDING TAB */}
            <TabsContent value="grounding" className="mt-4">
              {groundingStep !== null ? (
                <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const step = GROUNDING_STEPS[groundingStep];
                        const Icon = step.icon;
                        return (
                          <>
                            <Icon className="w-5 h-5 text-cyan-400" />
                            <span className="font-semibold text-foreground">
                              {step.count} things you {step.sense.toLowerCase()}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {groundingStep + 1} of 5
                    </span>
                  </div>
                  <p className="text-foreground/80 mb-4">{GROUNDING_STEPS[groundingStep].prompt}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGroundingStep(null)}
                    >
                      Stop
                    </Button>
                    <Button
                      size="sm"
                      onClick={nextGroundingStep}
                      className="flex-1"
                    >
                      {groundingStep < 4 ? 'Next' : 'Complete'}
                    </Button>
                  </div>
                </div>
              ) : breathPhase === 'idle' && (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-16 flex-col gap-1 bg-card/50 border-cyan-500/30 hover:bg-cyan-500/20"
                    onClick={startGrounding}
                  >
                    <Eye className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs">5-4-3-2-1</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex-col gap-1 bg-card/50 border-cyan-500/30 hover:bg-cyan-500/20"
                    onClick={startBreathing}
                  >
                    <Wind className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs">Breathe</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex-col gap-1 bg-card/50 border-cyan-500/30 hover:bg-cyan-500/20 col-span-2"
                    onClick={getMeditation}
                  >
                    <Sun className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs">Reflect</span>
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* MEMOS TAB */}
            <TabsContent value="memos" className="mt-4 space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Quick memo..."
                  value={newMemo}
                  onChange={(e) => setNewMemo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMemo()}
                  className="bg-card/50"
                />
                <Button onClick={addMemo} size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {memos.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No memos yet. Jot something down.
                  </p>
                ) : (
                  memos.map((memo) => (
                    <div 
                      key={memo.id}
                      className="bg-card/70 rounded-lg p-3 flex justify-between items-start gap-2"
                    >
                      <p className="text-sm text-foreground flex-1">{memo.text}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteMemo(memo.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* PREP LISTS TAB */}
            <TabsContent value="prep" className="mt-4 space-y-4">
              <p className="text-muted-foreground text-xs">
                Prepare for important appointments. Create a checklist.
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                {PREP_LIST_TYPES.map((type) => {
                  const Icon = type.icon;
                  const existing = prepLists.find(p => p.type === type.id);
                  return (
                    <Card
                      key={type.id}
                      className={cn(
                        "bg-card/70 cursor-pointer hover:bg-card/90 transition-all",
                        existing && "border-cyan-500/50"
                      )}
                      onClick={() => existing ? openPrepList(existing) : createPrepList(type)}
                    >
                      <CardHeader className="p-3">
                        <Icon className="w-5 h-5 text-cyan-400 mb-1" />
                        <CardTitle className="text-xs">{type.name}</CardTitle>
                        {existing && (
                          <CardDescription className="text-[10px]">
                            {existing.items.filter(i => i.checked).length}/{existing.items.length} done
                          </CardDescription>
                        )}
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* JOURNAL TAB */}
            <TabsContent value="journal" className="mt-4 space-y-4">
              <p className="text-muted-foreground text-sm">
                Write whatever comes to mind. Save to your device or let it disappear.
              </p>
              <Textarea
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                placeholder="What's on your mind?"
                className="min-h-[150px] bg-card/50"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={discardJournal}
                  disabled={!journalEntry.trim()}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Disappear
                </Button>
                <Button
                  onClick={saveJournal}
                  disabled={!journalEntry.trim()}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save to Phone
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <p className="text-foreground/40 text-xs text-center mt-4">
            The ocean doesn't judge. Neither do I.
          </p>
        </div>
      </main>

      {/* Prep List Sheet */}
      <Sheet open={showPrepSheet} onOpenChange={setShowPrepSheet}>
        <SheetContent className="bg-card border-border overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {selectedPrepType && (() => {
                const Icon = selectedPrepType.icon;
                return <Icon className="w-5 h-5 text-cyan-400" />;
              })()}
              {selectedPrepType?.name || 'Prep List'}
            </SheetTitle>
          </SheetHeader>
          
          {activePrepList && (
            <div className="mt-6 space-y-4">
              {/* Checklist */}
              <div className="space-y-2">
                {activePrepList.items.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                  >
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={() => togglePrepItem(index)}
                    />
                    <span className={cn(
                      "text-sm flex-1",
                      item.checked && "line-through text-muted-foreground"
                    )}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Add item */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add item..."
                  className="bg-muted/30"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addPrepItem((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
              </div>
              
              {/* Notes */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Notes</p>
                <Textarea
                  value={activePrepList.notes}
                  onChange={(e) => setActivePrepList({ ...activePrepList, notes: e.target.value })}
                  placeholder="Additional notes..."
                  className="bg-muted/30"
                />
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (activePrepList.id && prepLists.find(p => p.id === activePrepList.id)) {
                      deletePrepList(activePrepList.id);
                    }
                    setShowPrepSheet(false);
                    setActivePrepList(null);
                  }}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button onClick={savePrepList} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
