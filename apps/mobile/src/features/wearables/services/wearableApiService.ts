import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { apiFetch } from '../../../shared/api/apiClient';
import {
  WearableMetricRecord,
  WearableCorrelationInsights,
  NormalizedBiometrics
} from '../types/wearable.types';
import { HealthConnectBridge } from './healthConnectBridge';

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
    try {
      const response = await apiFetch(`/wearables/sync`, {
        method: 'POST',
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
    try {
      const response = await apiFetch(`/wearables/latest`, {
        method: 'GET'
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
    try {
      const response = await apiFetch(`/wearables/history?days=${days}`, {
        method: 'GET'
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
    try {
      const response = await apiFetch(`/wearables/insights`, {
        method: 'GET'
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
