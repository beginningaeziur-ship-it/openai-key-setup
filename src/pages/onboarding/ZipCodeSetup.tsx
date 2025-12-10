import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { useSAI } from '@/contexts/SAIContext';

export default function ZipCodeSetup() {
  const navigate = useNavigate();
  const { userProfile, setUserProfile } = useSAI();
  const [zipCode, setZipCode] = useState(userProfile?.zipCode || '');

  const handleContinue = () => {
    if (zipCode.length >= 5) {
      setUserProfile({
        ...userProfile,
        zipCode,
      });
    }
    navigate('/onboarding/who-model');
  };

  const handleSkip = () => {
    navigate('/onboarding/who-model');
  };

  const narration = 
    "I only need your ZIP code to find nearby shelters, clinics, disability services, and help. " +
    "Not your full address. Just the ZIP. This helps me connect you to real resources in your area. " +
    "You can skip this for now and add it later in Settings.";

  return (
    <OnboardingScreen
      screenId="zip-setup"
      title="Your Location"
      narration={narration}
    >
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full space-y-8">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
          <MapPin className="w-10 h-10 text-primary" />
        </div>

        {/* Explanation */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Find Help Near You</h2>
          <p className="text-muted-foreground">
            Your ZIP code helps me find local resources like shelters, food banks, clinics, and support services.
          </p>
        </div>

        {/* Input */}
        <div className="w-full space-y-4">
          <Input
            type="text"
            placeholder="Enter your ZIP code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
            className="text-center text-2xl h-14"
            maxLength={5}
          />
          <p className="text-xs text-muted-foreground text-center">
            US 5-digit ZIP code. This is never shared with anyone.
          </p>
        </div>

        {/* Buttons */}
        <div className="w-full space-y-3">
          <Button 
            onClick={handleContinue}
            className="w-full h-12"
            disabled={zipCode.length > 0 && zipCode.length < 5}
          >
            {zipCode.length >= 5 ? 'Continue' : 'Continue without ZIP'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="w-full text-muted-foreground"
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Skip for now
          </Button>
        </div>
      </div>
    </OnboardingScreen>
  );
}
