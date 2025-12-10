import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OnboardingProgress } from '@/components/sai/OnboardingProgress';
import { VoicePreviewSelector } from '@/components/voice/VoicePreviewSelector';
import { useSAI } from '@/contexts/SAIContext';
import type { VoicePreference } from '@/types/sai';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function SAIName() {
  const navigate = useNavigate();
  const { userProfile, setUserProfile, setOnboardingStep } = useSAI();
  
  const [saiNickname, setSaiNickname] = useState(userProfile?.saiNickname || 'SAI');
  const [voicePreference, setVoicePreference] = useState<VoicePreference>(
    userProfile?.voicePreference || 'echo'
  );

  const handleNext = () => {
    setUserProfile({
      ...userProfile,
      nickname: userProfile?.nickname || '',
      saiNickname,
      voicePreference,
      emergencyContact: userProfile?.emergencyContact || { nickname: '', phone: '' },
    });
    setOnboardingStep(2);
    navigate('/onboarding/user-info');
  };

  return (
    <div className="min-h-screen bg-gradient-calm p-6">
      <div className="max-w-lg mx-auto">
        <OnboardingProgress currentStep={1} totalSteps={9} />
        
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-display font-bold text-foreground">
              I'm SAI.
            </h1>
            <p className="text-lg text-muted-foreground">
              Pronounced like "sigh." What would you like to call me?
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border space-y-6">
            <div className="space-y-3">
              <Label htmlFor="saiNickname" className="text-base">
                My nickname
              </Label>
              <Input
                id="saiNickname"
                value={saiNickname}
                onChange={(e) => setSaiNickname(e.target.value)}
                placeholder="SAI"
                className="h-12 text-lg rounded-xl"
              />
              <p className="text-sm text-muted-foreground">
                You can call me anything you'd like — SAI, Coach, Buddy, or something personal to you.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-display font-semibold text-foreground text-center">
              Choose my voice & enable yours
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              Enable your microphone for live conversation, then pick my voice.
            </p>
            
            <VoicePreviewSelector
              selectedVoice={voicePreference}
              onSelect={(voice) => setVoicePreference(voice)}
              showMicActivation={true}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/onboarding')}
              className="flex-1 h-12 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!saiNickname.trim()}
              className="flex-1 h-12 rounded-xl"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
