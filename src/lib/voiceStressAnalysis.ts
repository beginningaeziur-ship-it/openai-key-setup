// Voice stress analysis utilities using Web Audio API
// Analyzes pitch, speed, volume, and breathing patterns

import { VoiceMetrics } from './stressDetection';

export interface AudioFeatures {
  pitch: number; // Hz
  pitchVariation: number; // Standard deviation
  volume: number; // 0-1
  volumeVariation: number;
  speechRate: number; // syllables per second estimate
  pauseRatio: number; // ratio of silence to speech
  energy: number; // RMS energy
  zeroCrossingRate: number; // indicator of noise/stress
}

export interface VoiceStressResult {
  metrics: VoiceMetrics;
  features: AudioFeatures;
  stressScore: number; // 0-100
  isBreathingRapid: boolean;
  isSpeechFast: boolean;
  isPitchElevated: boolean;
  isVolumeErratic: boolean;
}

// Baseline values for comparison (will be calibrated per user)
const BASELINE = {
  pitch: 150, // Hz (average speaking pitch)
  pitchMale: 120,
  pitchFemale: 200,
  volume: 0.3,
  speechRate: 4, // syllables/second
  pauseRatio: 0.3,
};

// Calculate RMS (Root Mean Square) energy
export function calculateRMS(buffer: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
}

// Calculate zero-crossing rate (higher = more noise/stress)
export function calculateZeroCrossingRate(buffer: Float32Array): number {
  let crossings = 0;
  for (let i = 1; i < buffer.length; i++) {
    if ((buffer[i] >= 0 && buffer[i - 1] < 0) || (buffer[i] < 0 && buffer[i - 1] >= 0)) {
      crossings++;
    }
  }
  return crossings / buffer.length;
}

// Simple pitch detection using autocorrelation
export function detectPitch(buffer: Float32Array, sampleRate: number): number {
  const SIZE = buffer.length;
  const MAX_SAMPLES = Math.floor(SIZE / 2);
  let bestOffset = -1;
  let bestCorrelation = 0;
  let rms = calculateRMS(buffer);

  // Not enough signal
  if (rms < 0.01) return 0;

  // Autocorrelation
  for (let offset = 50; offset < MAX_SAMPLES; offset++) {
    let correlation = 0;
    for (let i = 0; i < MAX_SAMPLES; i++) {
      correlation += Math.abs((buffer[i]) - (buffer[i + offset]));
    }
    correlation = 1 - (correlation / MAX_SAMPLES);
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
    }
  }

  if (bestCorrelation > 0.9 && bestOffset > 0) {
    return sampleRate / bestOffset;
  }
  return 0;
}

// Detect if audio contains speech vs silence
export function isSpeech(buffer: Float32Array, threshold: number = 0.02): boolean {
  return calculateRMS(buffer) > threshold;
}

// Analyze breathing pattern from audio gaps and low-frequency components
export function analyzeBreathing(
  speechSegments: { isSpeech: boolean; duration: number }[]
): 'deep' | 'normal' | 'shallow' | 'rapid' | 'gasping' {
  if (speechSegments.length < 3) return 'normal';

  // Calculate average pause duration
  const pauses = speechSegments.filter(s => !s.isSpeech);
  const speeches = speechSegments.filter(s => s.isSpeech);
  
  if (pauses.length === 0) return 'gasping'; // No pauses = gasping/rushing
  
  const avgPause = pauses.reduce((sum, p) => sum + p.duration, 0) / pauses.length;
  const avgSpeech = speeches.length > 0 
    ? speeches.reduce((sum, s) => sum + s.duration, 0) / speeches.length 
    : 0;

  // Very short pauses = rapid breathing
  if (avgPause < 0.3 && avgSpeech < 1) return 'rapid';
  if (avgPause < 0.5) return 'shallow';
  if (avgPause > 1.5) return 'deep';
  return 'normal';
}

// Convert pitch to speed category
export function categorizeSpeechSpeed(
  syllablesPerSecond: number
): 'slow' | 'normal' | 'fast' | 'very-fast' {
  if (syllablesPerSecond > 6) return 'very-fast';
  if (syllablesPerSecond > 4.5) return 'fast';
  if (syllablesPerSecond < 2) return 'slow';
  return 'normal';
}

// Convert volume to category
export function categorizeVolume(
  volume: number,
  baseline: number = 0.3
): 'quiet' | 'normal' | 'loud' | 'yelling' {
  const ratio = volume / baseline;
  if (ratio > 3) return 'yelling';
  if (ratio > 1.8) return 'loud';
  if (ratio < 0.4) return 'quiet';
  return 'normal';
}

// Convert pitch to category
export function categorizePitch(
  pitch: number,
  variation: number,
  baseline: number = 150
): 'low' | 'normal' | 'high' | 'shaky' {
  if (variation > 50) return 'shaky'; // High variation = shaky voice
  const ratio = pitch / baseline;
  if (ratio > 1.4) return 'high';
  if (ratio < 0.7) return 'low';
  return 'normal';
}

// Main analysis function - converts audio features to VoiceMetrics
export function analyzeVoiceStress(
  features: AudioFeatures,
  breathingPattern: 'deep' | 'normal' | 'shallow' | 'rapid' | 'gasping',
  userBaseline?: Partial<typeof BASELINE>
): VoiceStressResult {
  const baseline = { ...BASELINE, ...userBaseline };
  
  const speed = categorizeSpeechSpeed(features.speechRate);
  const volume = categorizeVolume(features.volume, baseline.volume);
  const pitch = categorizePitch(features.pitch, features.pitchVariation, baseline.pitch);
  const pauses = features.pauseRatio > 0.4 ? 'long' 
    : features.pauseRatio < 0.15 ? 'none' 
    : features.pauseRatio < 0.25 ? 'short' 
    : 'normal';

  const metrics: VoiceMetrics = {
    speed,
    volume,
    pitch,
    breathing: breathingPattern,
    pauses,
  };

  // Calculate stress score from features
  let stressScore = 0;
  
  // Breathing contributes most
  if (breathingPattern === 'gasping') stressScore += 35;
  else if (breathingPattern === 'rapid') stressScore += 25;
  else if (breathingPattern === 'shallow') stressScore += 15;

  // Speed
  if (speed === 'very-fast') stressScore += 20;
  else if (speed === 'fast') stressScore += 10;

  // Volume
  if (volume === 'yelling') stressScore += 20;
  else if (volume === 'loud') stressScore += 10;
  else if (volume === 'quiet') stressScore += 8; // Can indicate withdrawal

  // Pitch
  if (pitch === 'shaky') stressScore += 25;
  else if (pitch === 'high') stressScore += 12;

  // Pauses
  if (pauses === 'none') stressScore += 15;
  else if (pauses === 'short') stressScore += 8;

  // High zero-crossing rate indicates vocal strain/stress
  if (features.zeroCrossingRate > 0.1) stressScore += 10;

  return {
    metrics,
    features,
    stressScore: Math.min(stressScore, 100),
    isBreathingRapid: breathingPattern === 'rapid' || breathingPattern === 'gasping',
    isSpeechFast: speed === 'fast' || speed === 'very-fast',
    isPitchElevated: pitch === 'high' || pitch === 'shaky',
    isVolumeErratic: features.volumeVariation > 0.2,
  };
}
