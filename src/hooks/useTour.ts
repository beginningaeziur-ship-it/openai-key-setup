import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getTourForPath, tours } from '@/components/tour/tourConfigs';
import { isTourCompleted, markTourCompleted, resetAllTours } from '@/components/tour/GuidedTour';
import type { TourConfig } from '@/components/tour/GuidedTour';

interface UseTourReturn {
  currentTour: TourConfig | null;
  showTour: boolean;
  startTour: (tourId?: string) => void;
  completeTour: () => void;
  skipTour: () => void;
  resetTours: () => void;
}

export function useTour(): UseTourReturn {
  const location = useLocation();
  const [showTour, setShowTour] = useState(false);
  const [currentTour, setCurrentTour] = useState<TourConfig | null>(null);

  // Check for tour on route change
  useEffect(() => {
    const tour = getTourForPath(location.pathname);
    if (tour && !isTourCompleted(tour.id)) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setCurrentTour(tour);
        setShowTour(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const startTour = useCallback((tourId?: string) => {
    if (tourId && tours[tourId]) {
      setCurrentTour(tours[tourId]);
      setShowTour(true);
    } else {
      const tour = getTourForPath(location.pathname);
      if (tour) {
        setCurrentTour(tour);
        setShowTour(true);
      }
    }
  }, [location.pathname]);

  const completeTour = useCallback(() => {
    if (currentTour) {
      markTourCompleted(currentTour.id);
    }
    setShowTour(false);
    setCurrentTour(null);
  }, [currentTour]);

  const skipTour = useCallback(() => {
    if (currentTour) {
      markTourCompleted(currentTour.id);
    }
    setShowTour(false);
    setCurrentTour(null);
  }, [currentTour]);

  const resetTours = useCallback(() => {
    resetAllTours();
  }, []);

  return {
    currentTour,
    showTour,
    startTour,
    completeTour,
    skipTour,
    resetTours,
  };
}
