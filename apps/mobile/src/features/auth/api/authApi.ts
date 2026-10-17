import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { TokenStorage } from '../../../shared/storage/secureStore';

// Dynamically resolves host IP so physical devices on Expo Go can communicate with backend
const hostUri = Constants.expoConfig?.hostUri;
const host = hostUri ? hostUri.split(':')[0] : 'localhost';
const DEFAULT_API_BASE =
  process.env.EXPO_PUBLIC_API_URL && !process.env.EXPO_PUBLIC_API_URL.includes('localhost')
    ? process.env.EXPO_PUBLIC_API_URL
    : `http://${host}:4000/api/v1`;

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'patient' | 'admin';
  dateOfBirth: string;
  biologicalSex: 'male' | 'female' | 'other';
  skinType: 'type_1' | 'type_2' | 'type_3' | 'type_4' | 'type_5' | 'type_6';
  dietaryPreference: 'omnivore' | 'pescatarian' | 'vegetarian' | 'vegan';
  medicalConditions: string[];
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  dateOfBirth: string;
  biologicalSex: 'male' | 'female' | 'other';
  skinType: string;
  dietaryPreference: string;
  medicalConditions?: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const AuthApi = {
  async register(payload: RegisterPayload): Promise<{ user: UserProfile; tokens: AuthTokens }> {
    const res = await fetch(`${DEFAULT_API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'Registration failed.');
    }
    return json.data;
  },

  async login(payload: LoginPayload): Promise<{ user: UserProfile; tokens: AuthTokens }> {
    const res = await fetch(`${DEFAULT_API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'Authentication failed.');
    }
    return json.data;
  },

  async refreshToken(refreshToken: string): Promise<{ tokens: AuthTokens }> {
    const res = await fetch(`${DEFAULT_API_BASE}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'Token refresh failed.');
    }
    return json.data;
  },

  async logout(): Promise<void> {
    const refreshToken = await TokenStorage.getRefreshToken();
    const accessToken = await TokenStorage.getAccessToken();

    try {
      await fetch(`${DEFAULT_API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({ refreshToken })
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      await TokenStorage.clearAll();
    }
  },

  async forgotPassword(email: string): Promise<string> {
    const res = await fetch(`${DEFAULT_API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const json = await res.json();
    return json.message || 'Password reset requested.';
  },

  async getProfile(): Promise<UserProfile> {
    const token = await TokenStorage.getAccessToken();
    const res = await fetch(`${DEFAULT_API_BASE}/users/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'Failed to fetch user profile.');
    }
    return json.data;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const token = await TokenStorage.getAccessToken();
    const res = await fetch(`${DEFAULT_API_BASE}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'Failed to update profile.');
    }
    return json.data;
  }
};
