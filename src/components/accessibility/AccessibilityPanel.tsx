import React from 'react';
import { Settings2, Type, Contrast, Captions, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet';
import { useAccessibility, FontSize, ContrastMode } from '@/contexts/AccessibilityContext';
import { cn } from '@/lib/utils';

interface AccessibilityPanelProps {
  trigger?: React.ReactNode;
  className?: string;
}

const fontSizeLabels: Record<FontSize, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  xlarge: 'Extra Large',
};

const fontSizeValues: FontSize[] = ['small', 'medium', 'large', 'xlarge'];

const contrastOptions: { value: ContrastMode; label: string; description: string }[] = [
  { value: 'default', label: 'Default', description: 'Standard contrast' },
  { value: 'high', label: 'High', description: 'Increased contrast' },
  { value: 'low', label: 'Low', description: 'Reduced contrast' },
];

export function AccessibilityPanel({ trigger, className }: AccessibilityPanelProps) {
  const {
    fontSize,
    contrastMode,
    captionsEnabled,
    reduceMotion,
    setFontSize,
    setContrastMode,
    setCaptionsEnabled,
    setReduceMotion,
    resetToDefaults,
  } = useAccessibility();

  const fontSizeIndex = fontSizeValues.indexOf(fontSize);

  const handleFontSizeChange = (value: number[]) => {
    const newSize = fontSizeValues[value[0]];
    if (newSize) setFontSize(newSize);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'bg-black/40 hover:bg-black/60 text-white border border-white/20 gap-2',
              className
            )}
          >
            <Settings2 className="h-4 w-4" />
            <span className="text-xs">Accessibility</span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-80 bg-card border-border">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Settings2 className="h-5 w-5" />
            Accessibility
          </SheetTitle>
          <SheetDescription>
            Customize your experience
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Text Size</Label>
            </div>
            <div className="px-1">
              <Slider
                value={[fontSizeIndex]}
                onValueChange={handleFontSizeChange}
                max={3}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-muted-foreground">A</span>
                <span className="text-sm font-medium text-foreground">
                  {fontSizeLabels[fontSize]}
                </span>
                <span className="text-lg text-muted-foreground">A</span>
              </div>
            </div>
          </div>

          {/* Contrast Mode */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Contrast className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Contrast</Label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {contrastOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setContrastMode(option.value)}
                  className={cn(
                    'p-2 rounded-lg border text-xs font-medium transition-all',
                    contrastMode === option.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 text-foreground border-border hover:bg-muted'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Closed Captions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Captions className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium">Closed Captions</Label>
                <p className="text-xs text-muted-foreground">Show text for speech</p>
              </div>
            </div>
            <Switch
              checked={captionsEnabled}
              onCheckedChange={setCaptionsEnabled}
            />
          </div>

          {/* Reduce Motion */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium">Reduce Motion</Label>
                <p className="text-xs text-muted-foreground">Minimize animations</p>
              </div>
            </div>
            <Switch
              checked={reduceMotion}
              onCheckedChange={setReduceMotion}
            />
          </div>

          {/* Reset */}
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="w-full mt-4"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
