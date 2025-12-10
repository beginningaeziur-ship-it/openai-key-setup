// Bookshelf Panel - Scripts, Education, Advocacy Info
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useSupportMap } from '@/contexts/SupportMapContext';
import { BookOpen, FileText, Shield, Users, Play, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BookshelfPanelProps {
  open: boolean;
  onClose: () => void;
}

const advocacyScripts = [
  {
    id: 'doctor',
    title: 'Speaking to Your Doctor',
    situation: 'Medical appointments',
    script: `I'd like to discuss my symptoms with you. I've been experiencing [symptom] for [duration]. It affects my ability to [activity]. I've tried [what you've tried]. I would like us to explore options together.`,
  },
  {
    id: 'work',
    title: 'Requesting Accommodations',
    situation: 'Workplace',
    script: `I'm reaching out regarding workplace accommodations. Due to my condition, I would benefit from [specific accommodation]. This would help me perform my essential job functions while managing my health.`,
  },
  {
    id: 'boundary',
    title: 'Setting Boundaries',
    situation: 'Personal relationships',
    script: `I care about our relationship. Right now, I need [specific boundary]. This isn't about you - it's about what I need to stay well. I hope you can understand.`,
  },
  {
    id: 'crisis',
    title: 'Asking for Help',
    situation: 'Crisis moments',
    script: `I'm struggling right now and could use some support. You don't need to fix anything. What would help is [specific need - company, listening, practical help].`,
  },
];

const educationResources = [
  {
    category: 'Understanding Your Conditions',
    items: [
      { title: 'How PTSD Affects the Brain', description: 'The science of trauma responses' },
      { title: 'Chronic Pain Cycle', description: 'Understanding pain-stress connections' },
      { title: 'ADHD Executive Function', description: 'Why simple tasks feel hard' },
    ],
  },
  {
    category: 'Coping Strategies',
    items: [
      { title: 'Window of Tolerance', description: 'Understanding your capacity zone' },
      { title: 'Nervous System Regulation', description: 'Calming your body\'s alarm system' },
      { title: 'Radical Acceptance', description: 'Finding peace with what is' },
    ],
  },
  {
    category: 'Building Skills',
    items: [
      { title: 'Distress Tolerance', description: 'Surviving difficult moments' },
      { title: 'Emotional Regulation', description: 'Managing intense feelings' },
      { title: 'Interpersonal Effectiveness', description: 'Asking for what you need' },
    ],
  },
];

const advocacyInfo = {
  rights: [
    'Right to accommodations at work (ADA)',
    'Right to privacy about your conditions',
    'Right to refuse treatment',
    'Right to a second opinion',
    'Right to accessible services',
  ],
  resources: [
    { name: '988 Suicide & Crisis Lifeline', contact: '988' },
    { name: 'Crisis Text Line', contact: 'Text HOME to 741741' },
    { name: 'NAMI Helpline', contact: '1-800-950-6264' },
    { name: 'SAMHSA National Helpline', contact: '1-800-662-4357' },
  ],
};

export function BookshelfPanel({ open, onClose }: BookshelfPanelProps) {
  const { speak, voiceEnabled } = useVoiceSettings();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleReadScript = (script: string) => {
    if (voiceEnabled) {
      speak(script);
    }
  };

  const handleCopyScript = async (id: string, script: string) => {
    await navigator.clipboard.writeText(script);
    setCopiedId(id);
    toast({ description: 'Script copied to clipboard' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0">
        <SheetHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <BookOpen className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <SheetTitle>Resources & Scripts</SheetTitle>
              <SheetDescription>
                Education, advocacy tools, and helpful scripts
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="scripts" className="mt-4">
          <TabsList className="w-full justify-start px-6">
            <TabsTrigger value="scripts" className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Scripts
            </TabsTrigger>
            <TabsTrigger value="learn" className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Learn
            </TabsTrigger>
            <TabsTrigger value="rights" className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Rights
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <TabsContent value="scripts" className="px-6 pb-6 space-y-4">
              {advocacyScripts.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{item.situation}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 whitespace-pre-line">
                      {item.script}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleReadScript(item.script)}>
                        <Play className="w-3 h-3 mr-1" />
                        Read Aloud
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleCopyScript(item.id, item.script)}
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3 h-3 mr-1" />
                        ) : (
                          <Copy className="w-3 h-3 mr-1" />
                        )}
                        Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="learn" className="px-6 pb-6 space-y-6">
              {educationResources.map((section) => (
                <div key={section.category}>
                  <h3 className="font-medium mb-3">{section.category}</h3>
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <Card key={item.title} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="rights" className="px-6 pb-6 space-y-6">
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Your Rights
                </h3>
                <Card>
                  <CardContent className="p-4">
                    <ul className="space-y-2">
                      {advocacyInfo.rights.map((right, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                          {right}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Crisis Resources
                </h3>
                <div className="space-y-2">
                  {advocacyInfo.resources.map((resource) => (
                    <Card key={resource.name}>
                      <CardContent className="p-4 flex justify-between items-center">
                        <span className="font-medium text-sm">{resource.name}</span>
                        <span className="text-sm text-primary">{resource.contact}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
