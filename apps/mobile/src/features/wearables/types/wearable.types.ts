export interface IDeviceInfo {
  manufacturer?: string;
  model?: string;
  sourceApp?: string;
}

export interface NormalizedBiometrics {
  stepCount: number;
  restingHeartRate?: number;
  avgSpO2?: number;
  sleepDurationMinutes?: number;
  deepSleepMinutes?: number;
}

export interface WearableMetricRecord {
  id?: string;
  metricsDate: string; // YYYY-MM-DD
  deviceInfo?: IDeviceInfo;
  stepCount: number;
  restingHeartRate?: number;
  avgSpO2?: number;
  sleepDurationMinutes?: number;
  deepSleepMinutes?: number;
  syncedAt: string;
}

export type HealthConnectSupportTier =
  | 'tier1_native' // Android 14+ (API 34+) system service
  | 'tier2_standalone_ready' // Android 9-13 with app installed
  | 'tier2_install_needed' // Android 9-13 without app installed
  | 'tier3_unsupported' // Android <= 8.1 or non-Android
  | 'simulated'; // Simulator / Web test mode

export interface DeviceHealthConnectStatus {
  tier: HealthConnectSupportTier;
  isAvailable: boolean;
  permissionsGranted: boolean;
  userMessage: string;
  actionUrl?: string;
}

export interface WearableCorrelationInsights {
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

export interface VendorSyncGuide {
  id: string;
  name: string;
  badge: string;
  supportedModels: string;
  instructions: string[];
}
