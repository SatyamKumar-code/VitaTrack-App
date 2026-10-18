import { TokenStorage } from '../../../shared/storage/secureStore';
import { apiFetch, DEFAULT_API_BASE } from '../../../shared/api/apiClient';

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
  skinType?: string;
  dietaryPreference?: string;
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
    const res = await apiFetch(`/users/profile`, {
      method: 'GET'
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'Failed to fetch user profile.');
    }
    return json.data;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const res = await apiFetch(`/users/profile`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'Failed to update profile.');
    }
    return json.data;
  }
};
