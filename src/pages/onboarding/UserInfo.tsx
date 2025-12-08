import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OnboardingProgress } from '@/components/sai/OnboardingProgress';
import { useSAI } from '@/contexts/SAIContext';
import { ArrowLeft, ArrowRight, Phone, User } from 'lucide-react';

export default function UserInfo() {
  const navigate = useNavigate();
  const { userProfile, setUserProfile, setOnboardingStep } = useSAI();
  
  const [nickname, setNickname] = useState(userProfile?.nickname || '');
  const [emergencyNickname, setEmergencyNickname] = useState(
    userProfile?.emergencyContact?.nickname || ''
  );
  const [emergencyPhone, setEmergencyPhone] = useState(
    userProfile?.emergencyContact?.phone || ''
  );

  const handleNext = () => {
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        nickname,
        emergencyContact: {
          nickname: emergencyNickname,
          phone: emergencyPhone,
        },
      });
    }
    setOnboardingStep(3);
    navigate('/onboarding/who-model');
  };

  const isValid = nickname.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-calm p-6">
      <div className="max-w-lg mx-auto">
        <OnboardingProgress currentStep={2} totalSteps={6} />
        
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-display font-bold text-foreground">
              What do I call you?
            </h1>
            <p className="text-lg text-muted-foreground">
              Just a nickname — nothing official needed.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border space-y-6">
            <div className="space-y-3">
              <Label htmlFor="nickname" className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                Your nickname
              </Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="What should I call you?"
                className="h-12 text-lg rounded-xl"
              />
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-display font-semibold text-foreground">
                Emergency Contact
              </h2>
              <p className="text-sm text-muted-foreground">
                Someone who can help in a crisis. No legal names needed.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="emergencyNickname" className="text-base">
                  Their nickname
                </Label>
                <Input
                  id="emergencyNickname"
                  value={emergencyNickname}
                  onChange={(e) => setEmergencyNickname(e.target.value)}
                  placeholder="Mom, Alex, My therapist..."
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="emergencyPhone" className="text-base flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone number
                </Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/onboarding/cy-name')}
              className="flex-1 h-12 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isValid}
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
