import { NormalizedBiometrics } from '../types/wearable.types';

/**
 * Validates and normalizes raw biometric values imported from wearable sensors
 * or Android Health Connect records, adhering to physiological safety thresholds
 * specified in SMARTWATCH_INTEGRATION.md Section 4.
 */
export function validateAndNormalizeBiometrics(raw: any): NormalizedBiometrics {
  const rawSteps = typeof raw?.steps === 'number' ? raw.steps : typeof raw?.stepCount === 'number' ? raw.stepCount : 0;
  const result: NormalizedBiometrics = {
    stepCount: Math.min(Math.max(rawSteps, 0), 100000)
  };

  // Resting Heart rate validation: 30 to 220 bpm
  const hr = typeof raw?.heartRate === 'number' ? raw.heartRate : raw?.restingHeartRate;
  if (typeof hr === 'number' && hr >= 30 && hr <= 220) {
    result.restingHeartRate = Math.round(hr);
  }

  // SpO2 validation: 50.0% to 100.0%
  const spO2 = typeof raw?.spO2 === 'number' ? raw.spO2 : raw?.avgSpO2;
  if (typeof spO2 === 'number' && spO2 >= 50.0 && spO2 <= 100.0) {
    result.avgSpO2 = parseFloat(spO2.toFixed(1));
  }

  // Sleep validation: 0 to 1440 minutes (24 hours)
  const sleep = typeof raw?.sleepMinutes === 'number' ? raw.sleepMinutes : raw?.sleepDurationMinutes;
  if (typeof sleep === 'number' && sleep >= 0 && sleep <= 1440) {
    result.sleepDurationMinutes = Math.round(sleep);
  }

  // Deep sleep validation: 0 to 720 minutes (12 hours)
  const deepSleep = typeof raw?.deepSleepMinutes === 'number' ? raw.deepSleepMinutes : raw?.deepSleep;
  if (typeof deepSleep === 'number' && deepSleep >= 0 && deepSleep <= 720) {
    result.deepSleepMinutes = Math.round(deepSleep);
  }

  return result;
}
