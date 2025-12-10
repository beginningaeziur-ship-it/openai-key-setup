// Calm Settings Panel (Lamp)
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { Lamp, Volume2, Moon, Sun, Zap, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface CalmSettingsPanelProps {
  open: boolean;
  onClose: () => void;
  ambientVolume: number;
  onAmbientVolumeChange: (volume: number) => void;
}

export function CalmSettingsPanel({ 
  open, 
  onClose, 
  ambientVolume, 
  onAmbientVolumeChange 
}: CalmSettingsPanelProps) {
  const { voiceEnabled, setVoiceEnabled, speakingSpeed, setSpeakingSpeed, volume, setVolume } = useVoiceSettings();
  const [calmMode, setCalmMode] = useState(true);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/20">
              <Lamp className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <SheetTitle>Calm Settings</SheetTitle>
              <SheetDescription>
                Adjust the room to match your energy
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Calm mode toggle */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    {calmMode ? <Moon className="w-4 h-4 text-primary" /> : <Zap className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div>
                    <p className="font-medium">Calm Mode</p>
                    <p className="text-sm text-muted-foreground">
                      {calmMode ? 'Slower, gentler interactions' : 'Active, engaged mode'}
                    </p>
                  </div>
                </div>
                <Switch checked={calmMode} onCheckedChange={setCalmMode} />
              </div>
            </CardContent>
          </Card>

          {/* Voice settings */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">SAI Voice</span>
                </div>
                <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
              </div>

              {voiceEnabled && (
                <>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Voice Volume</span>
                      <span>{Math.round(volume * 100)}%</span>
                    </div>
                    <Slider
                      value={[volume * 100]}
                      onValueChange={(vals) => setVolume(vals[0] / 100)}
                      max={100}
                      step={5}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Speaking Speed</span>
                      <span>{speakingSpeed.toFixed(1)}x</span>
                    </div>
                    <Slider
                      value={[speakingSpeed * 50]}
                      onValueChange={(vals) => setSpeakingSpeed(vals[0] / 50)}
                      min={25}
                      max={100}
                      step={5}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Ambient sound volume */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Room Sound Volume</span>
                <span>{Math.round(ambientVolume * 100)}%</span>
              </div>
              <Slider
                value={[ambientVolume * 100]}
                onValueChange={(vals) => onAmbientVolumeChange(vals[0] / 100)}
                max={100}
                step={5}
              />
            </CardContent>
          </Card>
        </div>

        {/* Theme indicator */}
        <div className="mt-8 pt-6 border-t">
          <p className="text-xs text-muted-foreground text-center">
            This space adapts to you. Make it yours.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
