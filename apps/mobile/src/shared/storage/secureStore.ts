import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'VitaTrack_access_token',
  REFRESH_TOKEN: 'VitaTrack_refresh_token',
  USER_DATA: 'VitaTrack_user_data'
};

// Memory fallback for platforms where SecureStore is unavailable (e.g. standard Web preview)
const memoryStore: Record<string, string> = {};

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    memoryStore[key] = value;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore if localStorage unavailable
    }
    return;
  }
  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK
  });
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return memoryStore[key] || (typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null);
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    delete memoryStore[key];
    try {
      localStorage.removeItem(key);
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
