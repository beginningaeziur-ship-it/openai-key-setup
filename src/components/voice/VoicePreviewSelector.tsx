import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Volume2, VolumeX, Loader2, Check, Mic, MicOff, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMicrophone } from '@/contexts/MicrophoneContext';
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
  showMicActivation?: boolean;
}

export function VoicePreviewSelector({ selectedVoice, onSelect, showMicActivation = false }: VoicePreviewSelectorProps) {
  const { toast } = useToast();
  const { isMicEnabled, isMicMuted, enableMicrophone, toggleMute, isListening } = useMicrophone();
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

  const handleMicToggle = async () => {
    if (!isMicEnabled) {
      await enableMicrophone();
    } else {
      toggleMute();
    }
  };

  const isMicActive = isMicEnabled && !isMicMuted;

  return (
    <div className="space-y-4">
      {/* Microphone activation section */}
      {showMicActivation && (
        <div className={cn(
          "p-4 rounded-xl border-2 transition-all",
          isMicActive 
            ? "border-green-500/50 bg-green-500/10" 
            : "border-border bg-muted/30"
        )}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                isMicActive ? "bg-green-500/20" : "bg-muted"
              )}>
                {isMicActive ? (
                  <Mic className="w-5 h-5 text-green-500" />
                ) : (
                  <MicOff className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">
                  {isMicActive ? 'Microphone Active' : 'Enable Your Microphone'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isMicActive 
                    ? 'SAI is listening - speak naturally' 
                    : 'For live conversation with SAI'}
                </p>
              </div>
            </div>
            <Button
              variant={isMicActive ? "secondary" : "default"}
              size="sm"
              onClick={handleMicToggle}
              className="rounded-full"
            >
              {isMicActive ? (
                <>
                  <MicOff className="w-4 h-4 mr-1" />
                  Mute
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-1" />
                  Enable
                </>
              )}
            </Button>
          </div>
          
          {/* Warning notice */}
          {!isMicEnabled && (
            <div className="mt-3 flex items-start gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Your mic will stay active unless manually muted. 
                Use the mic button on any screen to mute.
              </p>
            </div>
          )}
          
          {/* Listening indicator */}
          {isListening && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" />
                <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              </div>
              <span className="text-xs text-green-600 dark:text-green-400">Listening...</span>
            </div>
          )}
        </div>
      )}

      {/* Voice selection header */}
      <div>
        <p className="text-sm font-medium mb-3">Choose SAI's voice:</p>
      </div>
      
      {/* Voice options */}
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