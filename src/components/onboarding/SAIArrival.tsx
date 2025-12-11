import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ConversationalScreen } from './ConversationalScreen';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { AccessibilityButton } from '@/components/accessibility/AccessibilityButton';

interface SAIArrivalProps {
  saiName: string;
  userName: string;
  onContinue: () => void;
}

export const SAIArrival: React.FC<SAIArrivalProps> = ({
  saiName,
  userName,
  onContinue,
}) => {
  const [hasAskedQuestion, setHasAskedQuestion] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentCaption, setCurrentCaption] = useState('');
  const { speak, stopSpeaking } = useVoiceSettings();
  const { captionsEnabled } = useAccessibility();

  // SAI's introduction - spoken aloud, minimal on screen
  const introScript = `I'm ${saiName} — your Supportive Intelligence Agent. Think of me as a service dog, an advocate, a guide. I'll walk with you through every step. You are safe here. Do you have any questions before we continue?`;

  const handleSpeechComplete = () => {
    setHasAskedQuestion(true);
    setIsReady(true);
  };

  // Update caption when SAI speaks
  const speakWithCaption = useCallback(async (text: string) => {
    if (captionsEnabled) {
      setCurrentCaption(text);
    }
    await speak(text);
  }, [speak, captionsEnabled]);

  const handleUserSpeech = useCallback(async (transcript: string) => {
    const lower = transcript.toLowerCase();
    
    // Check for questions or confusion
    if (lower.includes('what') || lower.includes('how') || lower.includes('why') || lower.includes('?')) {
      await speakWithCaption("I am here to help you navigate life, not control it. I teach you to make decisions, ground yourself when overwhelmed, and advocate for what you need. We go at your pace. You lead, I walk beside you. Ready to continue?");
    } 
    // Check for affirmative responses
    else if (lower.includes('yes') || lower.includes('ready') || lower.includes('continue') || lower.includes('okay') || lower.includes('ok') || lower.includes('sure')) {
      stopSpeaking();
      onContinue();
    }
    // Check for distress signals
    else if (lower.includes('scared') || lower.includes('nervous') || lower.includes('anxious') || lower.includes('worried')) {
      await speakWithCaption("That's completely okay. It's normal to feel that way. Take a breath with me. We'll go slow. There's no rush here. When you feel ready, just say continue.");
    }
    // Default acknowledgment
    else if (transcript.length > 3) {
      await speakWithCaption("I hear you. We can take this at whatever pace feels right. Ready to move forward?");
    }
  }, [speakWithCaption, stopSpeaking, onContinue]);

  const handleHesitation = useCallback(async () => {
    await speakWithCaption("Take your time. There's no rush. If you have questions, just ask. Or say continue when you're ready.");
  }, [speakWithCaption]);

  const handleContinue = () => {
    stopSpeaking();
    onContinue();
  };

  // Set initial caption when intro plays
  React.useEffect(() => {
    if (captionsEnabled) {
      setCurrentCaption(introScript);
    }
  }, [captionsEnabled, introScript]);

  return (
    <ConversationalScreen
      saiName={saiName}
      backgroundVariant="office"
      saiScript={introScript}
      headline="Meet SAI"
      onSpeechComplete={handleSpeechComplete}
      onUserSpeech={handleUserSpeech}
      onHesitation={handleHesitation}
      listenAfterSpeech={true}
      hesitationThreshold={10000}
    >
      {/* Accessibility Settings - Top Right */}
      <AccessibilityButton variant="floating" />

      {/* Closed Caption Display */}
      {captionsEnabled && currentCaption && (
        <div className="absolute bottom-32 left-4 right-4 z-40">
          <div className="bg-black/80 rounded-lg p-4 max-h-32 overflow-y-auto">
            <p className="text-white text-sm leading-relaxed">
              {currentCaption}
            </p>
          </div>
        </div>
      )}

      {isReady && (
        <Button
          onClick={handleContinue}
          size="lg"
          className="h-12 px-8 rounded-xl shadow-lg shadow-primary/30"
        >
          Continue
        </Button>
      )}
      
      <p className="text-white/40 text-xs text-center">
        Say "continue" or tap the button
      </p>
    </ConversationalScreen>
  );
};
