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
    "Let me be clear about what I do and don't do. " +
    "I don't store your personal information, conversations, diagnoses, or behaviors. " +
    "I don't monitor, track, or report you to anyone. " +
    "I don't act on your behalf or contact emergency services. " +
    "I remember your goals and progress — that's it. " +
    "The PIN protects your goals, not your identity.";

  const privacyPoints = [
    {
      icon: Shield,
      title: "No Personal Information Stored",
      description: "SAI does not store your identity, conversations, diagnoses, disabilities, urges, or behaviors."
    },
    {
      icon: Eye,
      title: "No Monitoring or Tracking",
      description: "SAI does not monitor, track, or report you. Staff see only progress percentages, not details."
    },
    {
      icon: Lock,
      title: "PIN Protects Goals, Not Identity",
      description: "Your PIN keeps your goals and progress private if someone else uses your device."
    },
    {
      icon: Trash2,
      title: "Urges Are Released, Not Stored",
      description: "When you talk through an urge, it's released after the moment. Nothing is saved or tracked."
    },
  ];

  return (
    <OnboardingScreen
      screenId="privacy-explanation"
      title="How SAI Works"
      narration={narration}
    >
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">SAI Remembers Goals, Not People</h2>
          <p className="text-muted-foreground mt-2">
            Here's exactly what SAI does and doesn't do.
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

        {/* Core truth */}
        <div className="mt-6 p-4 rounded-xl bg-sai-calm/20 border border-sai-calm-dark/20 text-center">
          <p className="text-sm text-foreground font-medium">
            "SAI remembers goals and progress, not people."
          </p>
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
