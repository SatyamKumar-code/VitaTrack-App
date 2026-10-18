import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { TokenStorage } from '../../../shared/storage/secureStore';
import {
  WearableMetricRecord,
  WearableCorrelationInsights,
  NormalizedBiometrics
} from '../types/wearable.types';
import { HealthConnectBridge } from './healthConnectBridge';

const hostUri = Constants.expoConfig?.hostUri;
const host = hostUri ? hostUri.split(':')[0] : 'localhost';
const DEFAULT_API_BASE =
  process.env.EXPO_PUBLIC_API_URL && !process.env.EXPO_PUBLIC_API_URL.includes('localhost')
    ? process.env.EXPO_PUBLIC_API_URL
    : `http://${host}:4000/api/v1`;

const LOCAL_LATEST_METRICS_KEY = 'vitatrack_latest_wearable_metrics';

export const WearableApiService = {
  /**
   * Save latest metrics locally for instant offline display
   */
  async saveLocalLatest(record: WearableMetricRecord): Promise<void> {
    try {
      const serialized = JSON.stringify(record);
      if (Platform.OS === 'web') {
        localStorage.setItem(LOCAL_LATEST_METRICS_KEY, serialized);
      } else {
        await SecureStore.setItemAsync(LOCAL_LATEST_METRICS_KEY, serialized);
      }
    } catch {
      // ignore local storage error
    }
  },

  async getLocalLatest(): Promise<WearableMetricRecord | null> {
    try {
      let serialized: string | null = null;
      if (Platform.OS === 'web') {
        serialized = localStorage.getItem(LOCAL_LATEST_METRICS_KEY);
      } else {
        serialized = await SecureStore.getItemAsync(LOCAL_LATEST_METRICS_KEY);
      }
      return serialized ? JSON.parse(serialized) : null;
    } catch {
      return null;
    }
  },

  /**
   * POST /api/v1/wearables/sync
   * Ingest biometric metrics synced from Health Connect
   */
  async syncBiometrics(payload: {
    deviceInfo?: any;
    metricsDate: string;
    data: NormalizedBiometrics;
  }): Promise<{ syncedAt: string; metric: WearableMetricRecord }> {
    const accessToken = await TokenStorage.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(`${DEFAULT_API_BASE}/wearables/sync`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error?.message || `Sync failed with HTTP ${response.status}`);
      }

      const json = await response.json();
      const syncedRecord: WearableMetricRecord = {
        id: json.data?.metric?._id,
        metricsDate: payload.metricsDate,
        deviceInfo: payload.deviceInfo,
        stepCount: payload.data.stepCount,
        restingHeartRate: payload.data.restingHeartRate,
        avgSpO2: payload.data.avgSpO2,
        sleepDurationMinutes: payload.data.sleepDurationMinutes,
        deepSleepMinutes: payload.data.deepSleepMinutes,
        syncedAt: json.data?.syncedAt || new Date().toISOString()
      };

      await this.saveLocalLatest(syncedRecord);
      return { syncedAt: syncedRecord.syncedAt, metric: syncedRecord };
    } catch (networkError: any) {
      // Save to offline resilience queue if offline
      const offlineRecord: WearableMetricRecord = {
        metricsDate: payload.metricsDate,
        deviceInfo: payload.deviceInfo,
        stepCount: payload.data.stepCount,
        restingHeartRate: payload.data.restingHeartRate,
        avgSpO2: payload.data.avgSpO2,
        sleepDurationMinutes: payload.data.sleepDurationMinutes,
        deepSleepMinutes: payload.data.deepSleepMinutes,
        syncedAt: new Date().toISOString()
      };
      await HealthConnectBridge.queueOfflineMetric(offlineRecord);
      await this.saveLocalLatest(offlineRecord);
      return { syncedAt: offlineRecord.syncedAt, metric: offlineRecord };
    }
  },

  /**
   * GET /api/v1/wearables/latest
   */
  async getLatestMetrics(): Promise<WearableMetricRecord | null> {
    const accessToken = await TokenStorage.getAccessToken();
    if (!accessToken) {
      return this.getLocalLatest();
    }

    try {
      const response = await fetch(`${DEFAULT_API_BASE}/wearables/latest`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return this.getLocalLatest();
      }

      const json = await response.json();
      if (json.data) {
        await this.saveLocalLatest(json.data);
        return json.data;
      }
      return this.getLocalLatest();
    } catch {
      return this.getLocalLatest();
    }
  },

  /**
   * GET /api/v1/wearables/history
   */
  async getMetricsHistory(days: number = 7): Promise<WearableMetricRecord[]> {
    const accessToken = await TokenStorage.getAccessToken();
    if (!accessToken) {
      const local = await this.getLocalLatest();
      return local ? [local] : [];
    }

    try {
      const response = await fetch(`${DEFAULT_API_BASE}/wearables/history?days=${days}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const local = await this.getLocalLatest();
        return local ? [local] : [];
      }

      const json = await response.json();
      return json.data || [];
    } catch {
      const local = await this.getLocalLatest();
      return local ? [local] : [];
    }
  },

  /**
   * GET /api/v1/wearables/insights
   */
  async getCorrelationInsights(): Promise<WearableCorrelationInsights | null> {
    const accessToken = await TokenStorage.getAccessToken();
    if (!accessToken) {
      return null;
    }

    try {
      const response = await fetch(`${DEFAULT_API_BASE}/wearables/insights`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return null;
      }

      const json = await response.json();
      return json.data || null;
    } catch {
      return null;
    }
  }
};
