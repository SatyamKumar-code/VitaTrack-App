import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'VitaTrack_access_token',
  REFRESH_TOKEN: 'VitaTrack_refresh_token',
  USER_DATA: 'VitaTrack_user_data'
};

// Memory fallback for platforms where SecureStore is unavailable
const memoryStore: Record<string, string> = {};

function setCookie(name: string, value: string, days = 30): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');
  for (let c of cookies) {
    c = c.trim();
    if (c.indexOf(prefix) === 0) {
      return decodeURIComponent(c.substring(prefix.length));
    }
  }
  return null;
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    memoryStore[key] = value;
    setCookie(key, value, 30);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch {
      // Ignore
    }
    return;
  }
  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK
  });
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    const fromCookie = getCookie(key);
    if (fromCookie) return fromCookie;
    try {
      if (typeof localStorage !== 'undefined') {
        const legacy = localStorage.getItem(key);
        if (legacy) {
          setCookie(key, legacy, 30);
          localStorage.removeItem(key);
          return legacy;
        }
      }
    } catch {
      // Ignore
    }
    return memoryStore[key] || null;
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    delete memoryStore[key];
    deleteCookie(key);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch {
      // Ignore
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const TokenStorage = {
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    await setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },

  async getAccessToken(): Promise<string | null> {
    return getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async saveUserData(userData: object): Promise<void> {
    await setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  },

  async getUserData<T>(): Promise<T | null> {
    const raw = await getItem(STORAGE_KEYS.USER_DATA);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async clearAll(): Promise<void> {
    await deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
    await deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
    await deleteItem(STORAGE_KEYS.USER_DATA);
  }
};

const HEALTH_PROFILE_KEY = 'VitaTrack_health_profile_completed';
const HEALTH_PROFILE_DATA_KEY = 'VitaTrack_health_profile_data';

export interface HealthProfileData {
  skinType: string;
  dietaryPreference: string;
  medicalConditions: string[];
}

export const HealthProfileStorage = {
  async isCompleted(userId?: string): Promise<boolean> {
    const key = userId ? `${HEALTH_PROFILE_KEY}_${userId}` : HEALTH_PROFILE_KEY;
    const val = await getItem(key);
    if (val === 'false') return false;
    if (val === 'true') return true;
    return false;
  },

  async setCompleted(userId?: string): Promise<void> {
    const key = userId ? `${HEALTH_PROFILE_KEY}_${userId}` : HEALTH_PROFILE_KEY;
    await setItem(key, 'true');
  },

  async setIncomplete(userId?: string): Promise<void> {
    const key = userId ? `${HEALTH_PROFILE_KEY}_${userId}` : HEALTH_PROFILE_KEY;
    await setItem(key, 'false');
  },

  async saveHealthProfile(data: HealthProfileData, userId?: string): Promise<void> {
    const key = userId ? `${HEALTH_PROFILE_DATA_KEY}_${userId}` : HEALTH_PROFILE_DATA_KEY;
    await setItem(key, JSON.stringify(data));
    await this.setCompleted(userId);
  },

  async getHealthProfile(userId?: string): Promise<HealthProfileData | null> {
    const key = userId ? `${HEALTH_PROFILE_DATA_KEY}_${userId}` : HEALTH_PROFILE_DATA_KEY;
    const val = await getItem(key);
    if (!val) return null;
    try {
      return JSON.parse(val) as HealthProfileData;
    } catch {
      return null;
    }
  },

  async clear(userId?: string): Promise<void> {
    const key = userId ? `${HEALTH_PROFILE_KEY}_${userId}` : HEALTH_PROFILE_KEY;
    const dataKey = userId ? `${HEALTH_PROFILE_DATA_KEY}_${userId}` : HEALTH_PROFILE_DATA_KEY;
    await deleteItem(key);
    await deleteItem(dataKey);
  }
};

