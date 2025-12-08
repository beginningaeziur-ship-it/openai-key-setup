import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Volume2, VolumeX, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { VoicePreference } from '@/types/sai';

const VOICE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sai-voice`;

interface VoiceOption {
  id: VoicePreference;
  label: string;
  description: string;
  previewText: string;
}

const voiceOptions: VoiceOption[] = [
  { 
    id: 'alloy', 
    label: 'Sarah', 
    description: 'Warm and steady',
    previewText: "Hey. I'm here for you. Take your time."
  },
  { 
    id: 'echo', 
    label: 'George', 
    description: 'Calm and reassuring',
    previewText: "Hey. I'm here for you. Take your time."
  },
  { 
    id: 'fable', 
    label: 'Matilda', 
    description: 'Gentle and expressive',
    previewText: "Hey. I'm here for you. Take your time."
  },
  { 
    id: 'onyx', 
    label: 'Callum', 
    description: 'Deep and grounding',
    previewText: "Hey. I'm here for you. Take your time."
  },
  { 
    id: 'nova', 
    label: 'Lily', 
    description: 'Soft and uplifting',
    previewText: "Hey. I'm here for you. Take your time."
  },
  { 
    id: 'shimmer', 
    label: 'Jessica', 
    description: 'Warm and soothing',
    previewText: "Hey. I'm here for you. Take your time."
  },
];

interface VoicePreviewSelectorProps {
  selectedVoice: VoicePreference;
  onSelect: (voice: VoicePreference) => void;
}

export function VoicePreviewSelector({ selectedVoice, onSelect }: VoicePreviewSelectorProps) {
  const { toast } = useToast();
  const [playingVoice, setPlayingVoice] = useState<VoicePreference | null>(null);
  const [loadingVoice, setLoadingVoice] = useState<VoicePreference | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  const stopAudio = () => {
    if (audioRef) {
      audioRef.pause();
      audioRef.currentTime = 0;
      setAudioRef(null);
    }
    setPlayingVoice(null);
  };

  const playPreview = async (voice: VoiceOption) => {
    // Stop any currently playing audio
    stopAudio();

    // If clicking the same voice that's playing, just stop
    if (playingVoice === voice.id) {
      return;
    }

    setLoadingVoice(voice.id);

    try {
      const response = await fetch(VOICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          text: voice.previewText,
          voice: voice.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Play the audio
      const audio = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
      setAudioRef(audio);
      setPlayingVoice(voice.id);
      
      audio.onended = () => {
        setPlayingVoice(null);
        setAudioRef(null);
      };
      
      audio.onerror = () => {
        setPlayingVoice(null);
        setAudioRef(null);
      };

      await audio.play();
    } catch (error) {
      console.error('Voice preview error:', error);
      toast({
        description: "Couldn't play preview. Try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingVoice(null);
    }
  };

  const handleSelect = (voice: VoiceOption) => {
    onSelect(voice.id);
  };

  return (
    <div className="space-y-3">
      {voiceOptions.map((voice) => {
        const isSelected = selectedVoice === voice.id;
        const isPlaying = playingVoice === voice.id;
        const isLoading = loadingVoice === voice.id;

        return (
          <div
            key={voice.id}
            className={cn(
              "relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
              isSelected 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            )}
            onClick={() => handleSelect(voice)}
          >
            {/* Selection indicator */}
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
              isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
            )}>
              {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>

            {/* Voice info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium">{voice.label}</p>
              <p className="text-sm text-muted-foreground">{voice.description}</p>
            </div>

            {/* Preview button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "shrink-0 h-10 w-10 rounded-full",
                isPlaying && "bg-primary/10 text-primary"
              )}
              onClick={(e) => {
                e.stopPropagation();
                playPreview(voice);
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
          </div>
        );
      })}
    </div>
  );
}