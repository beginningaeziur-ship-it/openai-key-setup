import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSAI } from '@/contexts/SAIContext';
import { useMicrophone } from '@/contexts/MicrophoneContext';
import { useVoiceSettings, type VoiceId } from '@/contexts/VoiceSettingsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { VoicePreviewSelector } from '@/components/voice/VoicePreviewSelector';
import { VoiceCalibration } from '@/components/settings/VoiceCalibration';
import type { VoicePreference } from '@/types/sai';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mic, 
  Volume2,
  Shield, 
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MicOff
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const voiceLabels: Record<VoicePreference, string> = {
  alloy: 'Sarah',
  echo: 'George',
  fable: 'Matilda',
  onyx: 'Callum',
  nova: 'Lily',
  shimmer: 'Jessica',
};

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile, setUserProfile, resetAll } = useSAI();
  const { 
    isMicEnabled, 
    isMicMuted, 
    enableMicrophone, 
    disableMicrophone, 
    toggleMute 
  } = useMicrophone();
  const { 
    voiceEnabled, 
    setVoiceEnabled, 
    voiceId, 
    setVoiceId,
    speakingSpeed,
    setSpeakingSpeed,
    volume,
    setVolume,
    speak 
  } = useVoiceSettings();
  
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [micOpen, setMicOpen] = useState(false);

  const handleReset = () => {
    resetAll();
    navigate('/onboarding');
  };

  const handleVoiceChange = (voice: VoicePreference) => {
    // Update both the user profile and voice settings
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        voicePreference: voice,
      });
    }
    setVoiceId(voice as VoiceId);
    toast({
      description: `Voice changed to ${voiceLabels[voice]}.`,
    });
    
    // Preview the new voice
    speak(`Hi, I'm ${voiceLabels[voice]}. Nice to meet you.`);
    setVoiceOpen(false);
  };

  const handleMicToggle = async () => {
    if (isMicEnabled) {
      disableMicrophone();
    } else {
      await enableMicrophone();
    }
  };

  const voiceLabel = voiceId ? voiceLabels[voiceId as VoicePreference] : 'Lily';

  return (
    <div className="min-h-screen bg-gradient-calm">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display font-bold text-lg">Settings</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Your nickname</span>
              <span className="font-medium">{userProfile?.nickname || 'Not set'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">SAI's nickname</span>
              <span className="font-medium">{userProfile?.saiNickname || 'SAI'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Voice Output Settings */}
        <Card>
          <Collapsible open={voiceOpen} onOpenChange={setVoiceOpen}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Voice Output
                </CardTitle>
                <Switch 
                  checked={voiceEnabled} 
                  onCheckedChange={setVoiceEnabled}
                />
              </div>
              <CardDescription>
                {voiceEnabled ? `SAI speaks with ${voiceLabel}'s voice` : 'Text only mode'}
              </CardDescription>
            </CardHeader>
            
            {voiceEnabled && (
              <CardContent className="space-y-6">
                {/* Voice Selection */}
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between cursor-pointer p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <span className="text-sm font-medium">Voice: {voiceLabel}</span>
                    {voiceOpen ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="pt-2">
                  <VoicePreviewSelector
                    selectedVoice={voiceId as VoicePreference || 'nova'}
                    onSelect={handleVoiceChange}
                  />
                </CollapsibleContent>

                {/* Speed Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Speaking Speed</span>
                    <span className="text-sm text-muted-foreground">{speakingSpeed.toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={[speakingSpeed]}
                    onValueChange={([value]) => setSpeakingSpeed(value)}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Slower</span>
                    <span>Normal</span>
                    <span>Faster</span>
                  </div>
                </div>

                {/* Volume Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Volume</span>
                    <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
                  </div>
                  <Slider
                    value={[volume]}
                    onValueChange={([value]) => setVolume(value)}
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                </div>
              </CardContent>
            )}
          </Collapsible>
        </Card>

        {/* Microphone Settings */}
        <Card>
          <Collapsible open={micOpen} onOpenChange={setMicOpen}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  Microphone
                </CardTitle>
                <Switch 
                  checked={isMicEnabled} 
                  onCheckedChange={handleMicToggle}
                />
              </div>
              <CardDescription>
                {isMicEnabled 
                  ? isMicMuted 
                    ? 'Microphone is muted' 
                    : 'SAI can hear you' 
                  : 'Voice input disabled'}
              </CardDescription>
            </CardHeader>
            
            {isMicEnabled && (
              <CardContent className="space-y-4">
                {/* Mute Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <span className="text-sm font-medium">Mute Microphone</span>
                    <p className="text-xs text-muted-foreground">Temporarily pause listening</p>
                  </div>
                  <Switch 
                    checked={isMicMuted} 
                    onCheckedChange={toggleMute}
                  />
                </div>
                
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full">
                    {micOpen ? 'Hide Calibration' : 'Voice Calibration'}
                    {micOpen ? (
                      <ChevronUp className="w-4 h-4 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-2" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="pt-4">
                    <VoiceCalibration />
                  </div>
                </CollapsibleContent>
              </CardContent>
            )}
          </Collapsible>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Contact nickname</span>
              <span className="font-medium">
                {userProfile?.emergencyContact?.nickname || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">
                {userProfile?.emergencyContact?.phone || 'Not set'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy
            </CardTitle>
            <CardDescription>
              Your data protection settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-sai-sage-light rounded-lg">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Conversations are never stored</p>
                <p className="text-xs text-muted-foreground">
                  Your chats with SAI are processed in real-time and not saved anywhere.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-sai-sage-light rounded-lg">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Symptoms stay private</p>
                <p className="text-xs text-muted-foreground">
                  Professionals only see category-level data, never specific symptoms.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reset */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Reset App
            </CardTitle>
            <CardDescription>
              Clear all your data and start fresh
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Reset All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all your settings, progress, and goals. 
                    You'll need to go through onboarding again. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>
                    Yes, reset everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
