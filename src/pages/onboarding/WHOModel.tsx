import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSAI } from '@/contexts/SAIContext';
import { WHOIntroScreen } from '@/components/onboarding/WHOIntroScreen';
import { WHOQuestionFlow } from '@/components/onboarding/WHOQuestionFlow';
import { 
  whoBodyFunctions, 
  whoActivityLimitations, 
  whoParticipationRestrictions, 
  whoEnvironmentalBarriers 
} from '@/data/saiCategories';

type Phase = 'intro' | 'questions' | 'complete';

// Convert data to spoken questions format
function buildQuestions() {
  const allQuestions = [];

  // Body Functions
  for (const item of whoBodyFunctions) {
    allQuestions.push({
      id: item.id,
      category: 'Body & Health',
      label: item.label,
      spokenQuestion: `Do you experience ${item.label.toLowerCase()}?`,
    });
  }

  // Activity Limitations
  for (const item of whoActivityLimitations) {
    allQuestions.push({
      id: `activity_${item.id}`,
      category: 'Daily Activities',
      label: item.label,
      spokenQuestion: `Do you have difficulty with ${item.label.toLowerCase()}?`,
    });
  }

  // Participation Restrictions
  for (const item of whoParticipationRestrictions) {
    allQuestions.push({
      id: `participation_${item.id}`,
      category: 'Life Participation',
      label: item.label,
      spokenQuestion: `Do you face challenges with ${item.label.toLowerCase()}?`,
    });
  }

  // Environmental Barriers
  for (const item of whoEnvironmentalBarriers) {
    allQuestions.push({
      id: `environment_${item.id}`,
      category: 'Environment & Circumstances',
      label: item.label,
      spokenQuestion: `Are you currently dealing with ${item.label.toLowerCase()}?`,
    });
  }

  return allQuestions;
}

export default function WHOModel() {
  const navigate = useNavigate();
  const { setWHOModel, setOnboardingStep } = useSAI();
  const [phase, setPhase] = useState<Phase>('intro');
  
  const questions = useMemo(() => buildQuestions(), []);

  const handleIntroComplete = () => {
    setPhase('questions');
  };

  const handleQuestionsComplete = (selectedIds: string[]) => {
    // Parse selected IDs back into WHO model categories
    const bodyFunctions = selectedIds.filter(id => 
      whoBodyFunctions.some(bf => bf.id === id)
    );
    const activityLimitations = selectedIds
      .filter(id => id.startsWith('activity_'))
      .map(id => id.replace('activity_', ''));
    const participationRestrictions = selectedIds
      .filter(id => id.startsWith('participation_'))
      .map(id => id.replace('participation_', ''));
    const environmentalBarriers = selectedIds
      .filter(id => id.startsWith('environment_'))
      .map(id => id.replace('environment_', ''));

    setWHOModel({
      bodyFunctions,
      activityLimitations,
      participationRestrictions,
      environmentalBarriers,
    });
    
    setOnboardingStep(4);
    navigate('/onboarding/categories');
  };

  const handleBack = () => {
    if (phase === 'questions') {
      setPhase('intro');
    } else {
      navigate('/onboarding/user-info');
    }
  };

  if (phase === 'intro') {
    return (
      <WHOIntroScreen 
        onContinue={handleIntroComplete}
      />
    );
  }

  return (
    <WHOQuestionFlow
      questions={questions}
      onComplete={handleQuestionsComplete}
      onBack={handleBack}
    />
  );
}
