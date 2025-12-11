import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ConversationalScreen } from './ConversationalScreen';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';

interface OnboardingExplanationProps {
  onContinue: () => void;
}

export const OnboardingExplanation: React.FC<OnboardingExplanationProps> = ({
  onContinue,
}) => {
  const [isReady, setIsReady] = useState(false);
  const { speak, stopSpeaking } = useVoiceSettings();

  // SAI explains privacy - voice-first, minimal text
  const privacyScript = `Let me explain how I protect you. I do not store your personal information. Nothing leaves your device. Nothing is sent anywhere. If you later connect to the Watcher app, your professionals only see a stability percentage and trend — never your private thoughts or conversations. Do you have any questions about your privacy?`;

  const handleSpeechComplete = () => {
    setIsReady(true);
  };

  const handleUserSpeech = useCallback(async (transcript: string) => {
    const lower = transcript.toLowerCase();
    
    // Check for questions
    if (lower.includes('what') || lower.includes('how') || lower.includes('who') || lower.includes('?') || lower.includes('watcher')) {
      await speak("The Watcher is an optional feature for your care team. They only see if you're stable, trending up or down. They never see what we talk about, your symptoms, or your private thoughts. You control everything. Ready to continue?");
    }
    // Affirmative responses
    else if (lower.includes('yes') || lower.includes('ready') || lower.includes('continue') || lower.includes('okay') || lower.includes('understand') || lower.includes('got it')) {
      stopSpeaking();
      onContinue();
    }
    // Concern or worry
    else if (lower.includes('worried') || lower.includes('concerned') || lower.includes('sure') || lower.includes('trust')) {
      await speak("I understand that trust takes time. Everything stays on your device. You are in complete control. When you feel ready, say continue.");
    }
    else if (transcript.length > 3) {
      await speak("I hear you. Take your time. Any other questions, or ready to continue?");
    }
  }, [speak, stopSpeaking, onContinue]);

  const handleHesitation = useCallback(async () => {
    await speak("It's okay to take a moment. Your privacy is important. If something is unclear, just ask. Otherwise, say continue when ready.");
  }, [speak]);

  const handleContinue = () => {
    stopSpeaking();
    onContinue();
  };

  return (
    <ConversationalScreen
      saiName="SAI"
      backgroundVariant="waiting"
      saiScript={privacyScript}
      headline="Your Privacy"
      onSpeechComplete={handleSpeechComplete}
      onUserSpeech={handleUserSpeech}
      onHesitation={handleHesitation}
      listenAfterSpeech={true}
      hesitationThreshold={12000}
    >
      {isReady && (
        <Button
          onClick={handleContinue}
          size="lg"
          className="h-12 px-8 rounded-xl shadow-lg shadow-primary/30"
        >
          I understand, continue
        </Button>
      )}
      
      <p className="text-white/40 text-xs text-center">
        Say "continue" when ready
      </p>
    </ConversationalScreen>
  );
};
