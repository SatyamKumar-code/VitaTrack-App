import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { TokenStorage } from '../storage/secureStore';

// Dynamically resolves backend API URL for Cloud (Render), Mobile Web, and Expo Go physical devices
const resolveApiBase = (): string => {
  // 1. Runtime injection via window.__VITATRACK_ENV__ (Docker runtime env injected by Nginx in mobile web)
  if (typeof window !== 'undefined' && (window as any).__VITATRACK_ENV__?.apiUrl) {
    const runtimeUrl = String((window as any).__VITATRACK_ENV__.apiUrl).trim();
    if (runtimeUrl && !runtimeUrl.includes('localhost')) {
      const trimmed = runtimeUrl.replace(/\/$/, '');
      return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
    }
  }

  // 2. Query param or LocalStorage override in browser web runtime (?apiUrl=https://backend.onrender.com)
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      const queryApi = params.get('apiUrl') || params.get('backendUrl');
      if (queryApi) {
        localStorage.setItem('vitatrack_backend_url', queryApi);
      }
      const saved = localStorage.getItem('vitatrack_backend_url');
      if (saved && !saved.includes('localhost')) {
        const trimmed = saved.trim().replace(/\/$/, '');
        return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
      }
    } catch {
      // Ignore storage errors in non-standard runtimes
    }
  }

  // 3. Explicit environment variable set and not pointing to localhost (build-time)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() && !envUrl.includes('localhost')) {
    const trimmed = envUrl.trim().replace(/\/$/, '');
    return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
  }

  // 4. Browser web runtime auto-detection (e.g. vitatrack-mobile-web.onrender.com -> vitatrack-backend.onrender.com)
  if (
    typeof window !== 'undefined' &&
    window.location &&
    window.location.hostname &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    const host = window.location.hostname;
    const backendHost = host.replace('mobile-web', 'backend').replace('mobile', 'backend');
    return `${window.location.protocol}//${backendHost}/api/v1`;
  }

  // 5. Expo Go physical device dynamic IP resolver
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri ? hostUri.split(':')[0] : 'localhost';
  return `http://${host}:4000/api/v1`;
};

export const DEFAULT_API_BASE = resolveApiBase();

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Auto-refreshing fetch wrapper.
 * Intercepts 401 Unauthorized responses, attempts a refresh using the stored
 * refreshToken, updates tokens in cookies/storage, and seamlessly retries the original request.
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<Response> {
  const url = endpoint.startsWith('http') ? endpoint : `${DEFAULT_API_BASE}${endpoint}`;

  // Attach current access token
  const token = await TokenStorage.getAccessToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (netErr) {
    throw netErr;
  }

  // If 401 Unauthorized and not already retrying, try to refresh tokens automatically
  if (response.status === 401 && !isRetry) {
    const refreshToken = await TokenStorage.getRefreshToken();
    if (!refreshToken) {
      return response;
    }

    if (isRefreshing) {
      // If another request already triggered refresh, wait for the new token
      return new Promise<Response>((resolve, reject) => {
        failedQueue.push({
          resolve: async (newToken: string) => {
            const retryHeaders = new Headers(options.headers || {});
            if (!retryHeaders.has('Content-Type') && !(options.body instanceof FormData)) {
              retryHeaders.set('Content-Type', 'application/json');
            }
            retryHeaders.set('Authorization', `Bearer ${newToken}`);
            try {
              const res = await fetch(url, { ...options, headers: retryHeaders });
              resolve(res);
            } catch (err) {
              reject(err);
            }
          },
          reject: (err: any) => {
            reject(err);
          }
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${DEFAULT_API_BASE}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      const refreshJson = await refreshRes.json();

      if (!refreshRes.ok || !refreshJson.data?.tokens) {
        throw new Error('Refresh token expired or invalid');
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshJson.data.tokens;
      await TokenStorage.saveTokens(newAccessToken, newRefreshToken);

      processQueue(null, newAccessToken);

      // Retry original request with newly acquired access token
      const retryHeaders = new Headers(options.headers || {});
      if (!retryHeaders.has('Content-Type') && !(options.body instanceof FormData)) {
        retryHeaders.set('Content-Type', 'application/json');
      }
      retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);

      return fetch(url, { ...options, headers: retryHeaders });
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      await TokenStorage.clearAll();
      return response;
    } finally {
      isRefreshing = false;
    }
  }

  return response;
}
