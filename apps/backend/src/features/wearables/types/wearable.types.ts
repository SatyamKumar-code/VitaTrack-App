import { Types } from 'mongoose';

export interface IDeviceInfo {
  manufacturer?: string;
  model?: string;
  sourceApp?: string;
}

export interface IBiometricData {
  stepCount: number;
  restingHeartRate?: number;
  avgSpO2?: number;
  sleepDurationMinutes?: number;
  deepSleepMinutes?: number;
}

export interface IWearableSyncPayload {
  deviceInfo?: IDeviceInfo;
  metricsDate: string; // YYYY-MM-DD
  data: IBiometricData;
}

export interface IWearableCorrelationInsights {
  hasWearableData: boolean;
  metricsDate?: string;
  sevenDayAverages: {
    avgSteps: number;
    avgRestingHeartRate: number | null;
    avgSleepMinutes: number | null;
    avgSpO2: number | null;
    daysRecorded: number;
  };
  assessmentCorrelation: {
    reportedFatigueLevel: string;
    fatigueCorrelationStatus: 'insufficient_data' | 'optimal' | 'contributing' | 'aggravating';
    sleepEvaluation: {
      status: 'insufficient' | 'suboptimal' | 'optimal' | 'not_tracked';
      summary: string;
    };
    activityEvaluation: {
      status: 'sedentary' | 'light' | 'active' | 'not_tracked';
      summary: string;
    };
    clinicalSynergyInsight: string;
  };
  generatedAt: string;
}
