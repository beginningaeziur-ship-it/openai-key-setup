// Lamp Panel - Voice Settings (speed, tone, volume)
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useVoiceSettings, type VoiceId } from '@/contexts/VoiceSettingsContext';
import { useSupportMap } from '@/contexts/SupportMapContext';
import { useSpeechOnly } from '@/contexts/SpeechOnlyContext';
import { Lightbulb, Volume2, Gauge, MessageCircle, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LampPanelProps {
  open: boolean;
  onClose: () => void;
}

const voiceOptions: { id: VoiceId; name: string; description: string }[] = [
  { id: 'nova', name: 'Lily', description: 'Warm and gentle' },
  { id: 'alloy', name: 'Sarah', description: 'Calm and neutral' },
  { id: 'shimmer', name: 'Jessica', description: 'Soft and soothing' },
  { id: 'echo', name: 'George', description: 'Steady and grounded' },
  { id: 'onyx', name: 'Callum', description: 'Deep and reassuring' },
  { id: 'fable', name: 'Matilda', description: 'Clear and direct' },
];

const toneOptions = [
  { id: 'gentle', label: 'Gentle', description: 'Soft and slow' },
  { id: 'honest', label: 'Balanced', description: 'Clear and supportive' },
  { id: 'direct', label: 'Direct', description: 'Concise and firm' },
];

export function LampPanel({ open, onClose }: LampPanelProps) {
  const { 
    voiceEnabled, 
    setVoiceEnabled,
    voiceId,
    setVoiceId,
    speakingSpeed,
    setSpeakingSpeed,
    volume,
    setVolume,
    speak,
  } = useVoiceSettings();
  
  const { supportMap, updateAdaptations } = useSupportMap();
  const { speechOnlyMode, setSpeechOnlyMode } = useSpeechOnly();
  
  const currentTone = supportMap.adaptations.tonePreference;

  const handleVoicePreview = (id: VoiceId, name: string) => {
    setVoiceId(id);
    speak(`Hi, I'm ${name}. I'll be here to support you.`);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-400/20">
              <Lightbulb className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <SheetTitle>Voice Settings</SheetTitle>
              <SheetDescription>
                Customize how SAI speaks to you
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-8">
          {/* Voice On/Off */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label className="font-medium">Voice Output</Label>
                <p className="text-sm text-muted-foreground">
                  {voiceEnabled ? 'SAI speaks aloud' : 'Text only'}
                </p>
              </div>
            </div>
            <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
          </div>

          {/* Speech-Only Mode */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label className="font-medium">Speech-Only Mode</Label>
                <p className="text-sm text-muted-foreground">
                  {speechOnlyMode ? 'Voice interaction only' : 'Show text input'}
                </p>
              </div>
            </div>
            <Switch checked={speechOnlyMode} onCheckedChange={setSpeechOnlyMode} />
          </div>

          {voiceEnabled && (
            <>
              {/* Voice Selection */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Voice
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {voiceOptions.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => handleVoicePreview(voice.id, voice.name)}
                      className={cn(
                        'p-3 rounded-lg border-2 text-left transition-all',
                        voiceId === voice.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-transparent bg-muted/50 hover:bg-muted'
                      )}
                    >
                      <span className="font-medium text-sm">{voice.name}</span>
                      <p className="text-xs text-muted-foreground">{voice.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    Speaking Speed
                  </Label>
                  <span className="text-sm text-muted-foreground">{speakingSpeed.toFixed(1)}x</span>
                </div>
                <Slider
                  value={[speakingSpeed]}
                  onValueChange={([v]) => setSpeakingSpeed(v)}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Slower</span>
                  <span>Faster</span>
                </div>
              </div>

              {/* Volume Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Volume
                  </Label>
                  <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
                </div>
                <Slider
                  value={[volume]}
                  onValueChange={([v]) => setVolume(v)}
                  min={0}
                  max={1}
                  step={0.05}
                />
              </div>
            </>
          )}

          {/* Tone Selection */}
          <div className="space-y-3">
            <Label>Response Tone</Label>
            <RadioGroup
              value={currentTone}
              onValueChange={(v) => updateAdaptations({ tonePreference: v as 'gentle' | 'honest' | 'direct' })}
              className="space-y-2"
            >
              {toneOptions.map((tone) => (
                <div key={tone.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <RadioGroupItem value={tone.id} id={`tone-${tone.id}`} />
                  <Label htmlFor={`tone-${tone.id}`} className="flex-1 cursor-pointer">
                    <span className="font-medium">{tone.label}</span>
                    <p className="text-xs text-muted-foreground">{tone.description}</p>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
