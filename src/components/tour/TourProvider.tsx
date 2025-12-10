import { createContext, useContext, ReactNode } from 'react';
import { useTour } from '@/hooks/useTour';
import { GuidedTour } from './GuidedTour';
import { useSAI } from '@/contexts/SAIContext';
import type { TourConfig } from './GuidedTour';

interface TourContextType {
  startTour: (tourId?: string) => void;
  resetTours: () => void;
  showTour: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

interface TourProviderProps {
  children: ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const { currentTour, showTour, startTour, completeTour, skipTour, resetTours } = useTour();
  const { userProfile } = useSAI();

  const saiName = userProfile?.saiNickname || 'SAI';

  return (
    <TourContext.Provider value={{ startTour, resetTours, showTour }}>
      {children}
      {showTour && currentTour && (
        <GuidedTour
          tour={currentTour}
          onComplete={completeTour}
          onSkip={skipTour}
          saiName={saiName}
        />
      )}
    </TourContext.Provider>
  );
}

export function useTourContext() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTourContext must be used within a TourProvider');
  }
  return context;
}
