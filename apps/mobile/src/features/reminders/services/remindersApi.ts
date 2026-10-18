import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { TokenStorage } from '../../../shared/storage/secureStore';
import { apiFetch, DEFAULT_API_BASE } from '../../../shared/api/apiClient';
import { ReminderPreferences, ReminderType } from '../types/reminder.types';

const LOCAL_PREFS_KEY = 'vitatrack_local_reminder_prefs';

const DEFAULT_PREFERENCES: ReminderPreferences = {
  sunlightReminderEnabled: true,
  sunlightTime: '10:30',
  dietaryReminderEnabled: true,
  dietaryTime: '12:30',
  supplementReminderEnabled: true,
  supplementTime: '09:00',
  reassessmentReminderEnabled: true,
  reassessmentIntervalDays: 14
};

export const RemindersApi = {
  /**
   * Save preferences to local device storage for offline resilience
   */
  async saveLocalPreferences(prefs: ReminderPreferences): Promise<void> {
    try {
      const serialized = JSON.stringify(prefs);
      if (Platform.OS === 'web') {
        localStorage.setItem(LOCAL_PREFS_KEY, serialized);
      } else {
        await SecureStore.setItemAsync(LOCAL_PREFS_KEY, serialized);
      }
    } catch {
      // ignore storage failure
    }
  },

  /**
   * Load locally saved preferences
   */
  async getLocalPreferences(): Promise<ReminderPreferences> {
    try {
      let serialized: string | null = null;
      if (Platform.OS === 'web') {
        serialized = localStorage.getItem(LOCAL_PREFS_KEY);
      } else {
        serialized = await SecureStore.getItemAsync(LOCAL_PREFS_KEY);
      }
      if (serialized) {
        return JSON.parse(serialized);
      }
    } catch {
      // return default
    }
    return DEFAULT_PREFERENCES;
  },

  /**
   * Fetch user reminder preferences from backend API with offline fallback
   */
  async fetchPreferences(): Promise<ReminderPreferences> {
    const token = await TokenStorage.getAccessToken();

    if (!token) {
      return this.getLocalPreferences();
    }

    try {
      const res = await apiFetch(`/reminders`, {
        method: 'GET'
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const json = await res.json();
      const prefs = json.data as ReminderPreferences;
      await this.saveLocalPreferences(prefs);
      return prefs;
    } catch (err) {
      console.warn('[RemindersApi] Failed to fetch remote preferences, using local cache:', err);
      return this.getLocalPreferences();
    }
  },

  /**
   * Update user reminder preferences to backend API and local store
   */
  async updatePreferences(updates: Partial<ReminderPreferences>): Promise<ReminderPreferences> {
    const current = await this.getLocalPreferences();
    const merged: ReminderPreferences = { ...current, ...updates };

    await this.saveLocalPreferences(merged);

    const token = await TokenStorage.getAccessToken();
    if (!token) {
      return merged;
    }

    try {
      const res = await apiFetch(`/reminders`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `API returned ${res.status}`);
      }

      const json = await res.json();
      const remotePrefs = json.data as ReminderPreferences;
      await this.saveLocalPreferences(remotePrefs);
      return remotePrefs;
    } catch (err) {
      console.warn('[RemindersApi] Remote update failed, persisted locally:', err);
      return merged;
    }
  },

  /**
   * Request backend test notification generation
   */
  async requestBackendTest(
    type: ReminderType,
    durationMinutes?: number,
    intervalDays?: number
  ): Promise<{ title: string; body: string } | null> {
    const token = await TokenStorage.getAccessToken();
    if (!token) return null;

    try {
      const res = await fetch(`${DEFAULT_API_BASE}/reminders/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type, durationMinutes, intervalDays })
      });

      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    } catch {
      return null;
    }
  }
};
