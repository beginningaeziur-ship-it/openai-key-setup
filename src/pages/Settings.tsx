import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSAI } from '@/contexts/SAIContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { VoicePreviewSelector } from '@/components/voice/VoicePreviewSelector';
import { VoiceCalibration } from '@/components/settings/VoiceCalibration';
import type { VoicePreference } from '@/types/sai';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mic, 
  Shield, 
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Check
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
  const [voiceOpen, setVoiceOpen] = useState(false);

  const handleReset = () => {
    resetAll();
    navigate('/onboarding');
  };

  const handleVoiceChange = (voice: VoicePreference) => {
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        voicePreference: voice,
      });
      toast({
        description: `Voice changed to ${voiceLabels[voice]}.`,
      });
      setVoiceOpen(false);
    }
  };

  const voiceLabel = userProfile?.voicePreference 
    ? voiceLabels[userProfile.voicePreference] 
    : 'Not set';

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

        {/* Voice */}
        <Card>
          <Collapsible open={voiceOpen} onOpenChange={setVoiceOpen}>
            <CardHeader className="pb-3">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer">
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="w-5 h-5" />
                    Voice
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{voiceLabel}</span>
                    {voiceOpen ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CardDescription>
                Change Cy's voice anytime
              </CardDescription>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <VoicePreviewSelector
                  selectedVoice={userProfile?.voicePreference || 'alloy'}
                  onSelect={handleVoiceChange}
                />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Voice Calibration */}
        <VoiceCalibration />

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
                  Your chats with Cy are processed in real-time and not saved anywhere.
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
