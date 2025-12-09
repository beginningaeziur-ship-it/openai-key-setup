import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  analyzeStress, 
  StressAnalysis, 
  StressLevel, 
  VoiceMetrics, 
  BehavioralPattern,
  getStressResponse
} from '@/lib/stressDetection';

interface StressMonitorState {
  currentAnalysis: StressAnalysis;
  stressHistory: { timestamp: number; level: StressLevel; score: number }[];
  isElevated: boolean;
  needsIntervention: boolean;
  interventionMessage: string | null;
}

interface UseStressMonitorReturn {
  state: StressMonitorState;
  analyzeMessage: (text: string) => StressAnalysis;
  updateVoiceMetrics: (metrics: VoiceMetrics) => void;
  acknowledgeIntervention: () => void;
  resetMonitor: () => void;
  getAverageStress: () => number;
  getTrend: () => 'improving' | 'stable' | 'worsening';
}

const DEFAULT_ANALYSIS: StressAnalysis = {
  level: 'calm',
  score: 0,
  triggers: [],
  recommendedAction: 'monitor',
};

export function useStressMonitor(saiName: string = 'SAI'): UseStressMonitorReturn {
  const [state, setState] = useState<StressMonitorState>({
    currentAnalysis: DEFAULT_ANALYSIS,
    stressHistory: [],
    isElevated: false,
    needsIntervention: false,
    interventionMessage: null,
  });

  const behaviorPatternsRef = useRef<BehavioralPattern[]>([]);
  const voiceMetricsRef = useRef<VoiceMetrics | undefined>();
  const lastMessageTimeRef = useRef<number>(Date.now());
  const messageCountRef = useRef<number>(0);
  const interventionCooldownRef = useRef<number>(0);

  // Calculate message frequency
  const calculateFrequency = useCallback(() => {
    const now = Date.now();
    const elapsed = (now - lastMessageTimeRef.current) / 60000; // minutes
    if (elapsed > 0) {
      return messageCountRef.current / elapsed;
    }
    return 0;
  }, []);

  // Analyze a message and update state
  const analyzeMessage = useCallback((text: string): StressAnalysis => {
    const now = Date.now();
    messageCountRef.current++;

    // Create behavioral pattern entry
    const pattern: BehavioralPattern = {
      messageFrequency: calculateFrequency(),
      averageMessageLength: text.length,
      repetitiveContent: false, // Would need previous messages to detect
      allCaps: text === text.toUpperCase() && text.length > 5,
      fragmentedSentences: text.split(/[.!?]/).filter(s => s.trim()).length > 3 && text.length < 50,
      timestamp: now,
    };

    behaviorPatternsRef.current.push(pattern);
    if (behaviorPatternsRef.current.length > 20) {
      behaviorPatternsRef.current = behaviorPatternsRef.current.slice(-20);
    }

    // Run full stress analysis
    const analysis = analyzeStress(
      text,
      voiceMetricsRef.current,
      behaviorPatternsRef.current
    );

    // Check if intervention is needed (with cooldown)
    const needsIntervention = 
      (analysis.recommendedAction !== 'monitor' && analysis.recommendedAction !== 'gentle-checkin') &&
      now - interventionCooldownRef.current > 30000; // 30 second cooldown

    let interventionMessage: string | null = null;
    if (needsIntervention) {
      interventionMessage = getStressResponse(analysis, saiName);
      interventionCooldownRef.current = now;
    }

    setState(prev => ({
      currentAnalysis: analysis,
      stressHistory: [
        ...prev.stressHistory.slice(-50),
        { timestamp: now, level: analysis.level, score: analysis.score }
      ],
      isElevated: analysis.level !== 'calm' && analysis.level !== 'mild',
      needsIntervention,
      interventionMessage,
    }));

    lastMessageTimeRef.current = now;

    return analysis;
  }, [calculateFrequency, saiName]);

  // Update voice metrics from audio analysis
  const updateVoiceMetrics = useCallback((metrics: VoiceMetrics) => {
    voiceMetricsRef.current = metrics;

    // Re-analyze if we have recent text
    if (behaviorPatternsRef.current.length > 0) {
      const lastPattern = behaviorPatternsRef.current[behaviorPatternsRef.current.length - 1];
      if (Date.now() - lastPattern.timestamp < 10000) {
        // Recent message exists, update analysis with voice data
        const analysis = analyzeStress(
          '', // No new text
          metrics,
          behaviorPatternsRef.current
        );

        setState(prev => ({
          ...prev,
          currentAnalysis: {
            ...prev.currentAnalysis,
            score: Math.max(prev.currentAnalysis.score, analysis.score),
            triggers: [...new Set([...prev.currentAnalysis.triggers, ...analysis.triggers])],
          },
          isElevated: analysis.level !== 'calm' && analysis.level !== 'mild',
        }));
      }
    }
  }, []);

  // Acknowledge intervention (user has seen/responded to it)
  const acknowledgeIntervention = useCallback(() => {
    setState(prev => ({
      ...prev,
      needsIntervention: false,
      interventionMessage: null,
    }));
  }, []);

  // Reset the monitor
  const resetMonitor = useCallback(() => {
    behaviorPatternsRef.current = [];
    voiceMetricsRef.current = undefined;
    messageCountRef.current = 0;
    lastMessageTimeRef.current = Date.now();
    interventionCooldownRef.current = 0;

    setState({
      currentAnalysis: DEFAULT_ANALYSIS,
      stressHistory: [],
      isElevated: false,
      needsIntervention: false,
      interventionMessage: null,
    });
  }, []);

  // Get average stress over recent history
  const getAverageStress = useCallback(() => {
    const recent = state.stressHistory.slice(-10);
    if (recent.length === 0) return 0;
    return Math.round(recent.reduce((sum, h) => sum + h.score, 0) / recent.length);
  }, [state.stressHistory]);

  // Get stress trend
  const getTrend = useCallback((): 'improving' | 'stable' | 'worsening' => {
    const history = state.stressHistory;
    if (history.length < 3) return 'stable';

    const recentAvg = history.slice(-3).reduce((sum, h) => sum + h.score, 0) / 3;
    const olderAvg = history.slice(-6, -3).reduce((sum, h) => sum + h.score, 0) / 
      Math.min(3, history.slice(-6, -3).length);

    if (recentAvg < olderAvg - 10) return 'improving';
    if (recentAvg > olderAvg + 10) return 'worsening';
    return 'stable';
  }, [state.stressHistory]);

  return {
    state,
    analyzeMessage,
    updateVoiceMetrics,
    acknowledgeIntervention,
    resetMonitor,
    getAverageStress,
    getTrend,
  };
}
