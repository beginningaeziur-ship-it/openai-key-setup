import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';

export default function PrivacyExplanation() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/onboarding/pin');
  };

  const narration = 
    "Your privacy and safety are my priority. " +
    "I don't store your personal information beyond what keeps you safe. " +
    "Your PIN protects this app if someone else picks up your phone. " +
    "You decide what anyone else sees. " +
    "Nothing you share leaves your device without your permission.";

  const privacyPoints = [
    {
      icon: Lock,
      title: "Protected by PIN",
      description: "A simple PIN keeps your information safe if someone else accesses your phone."
    },
    {
      icon: Eye,
      title: "You Control Visibility",
      description: "You decide what professionals or watchers can see. Nothing is shared without your choice."
    },
    {
      icon: Trash2,
      title: "No Unnecessary Storage",
      description: "I only keep what helps me support you. Voice conversations aren't stored long-term."
    },
    {
      icon: Shield,
      title: "Local-First",
      description: "Most of your information stays on your device, not on remote servers."
    },
  ];

  return (
    <OnboardingScreen
      screenId="privacy-explanation"
      title="Privacy & Safety"
      narration={narration}
    >
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Your Privacy Matters</h2>
          <p className="text-muted-foreground mt-2">
            Here's how I keep your information safe.
          </p>
        </div>

        {/* Privacy Points */}
        <div className="space-y-4 flex-1">
          {privacyPoints.map((point, index) => (
            <div 
              key={index}
              className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <point.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{point.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{point.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <div className="mt-8">
          <Button 
            onClick={handleContinue}
            className="w-full h-12"
          >
            I understand — Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </OnboardingScreen>
  );
}
