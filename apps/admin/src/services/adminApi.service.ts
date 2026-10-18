import { AdminHealthData, AdminMetricsData, AdminAuditLogEntry, AdminUser } from '../types/admin.types';

const API_BASE = 'http://localhost:4000/api/v1';

export class AdminApiService {
  private static tokenKey = 'vitatrack_admin_token';
  private static userKey = 'vitatrack_admin_user';

  public static getStoredToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch {
      return null;
    }
  }

  public static getStoredUser(): AdminUser | null {
    try {
      const data = localStorage.getItem(this.userKey);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public static setAuth(token: string, user: AdminUser): void {
    try {
      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } catch {
      // In-memory fallback
    }
  }

  public static clearAuth(): void {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    } catch {
      // Ignore
    }
  }

  public static async login(
    email: string,
    passwordPlain: string
  ): Promise<{ user: AdminUser; token: string }> {
    const res = await fetch(`${API_BASE}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: passwordPlain })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message || `Login failed with status ${res.status}`);
    }

    const adminUser: AdminUser = data.data.user;
    const token: string = data.data.tokens.accessToken;
    this.setAuth(token, adminUser);
    return { user: adminUser, token };
  }

  public static async probeServerHealth(): Promise<{
    isProcessRunning: boolean;
    httpStatus: number | null;
    rawError: string | null;
    healthData: {
      status: string;
      service: string;
      uptimeSeconds: number;
      database: {
        status: string;
        readyState: number;
        lastError: string | null;
      };
    } | null;
  }> {
    try {
      const res = await fetch('http://localhost:4000/health');
      const data = await res.json();
      return {
        isProcessRunning: true,
        httpStatus: res.status,
        rawError: null,
        healthData: data
      };
    } catch (err: unknown) {
      return {
        isProcessRunning: false,
        httpStatus: null,
        rawError: err instanceof Error ? err.message : String(err),
        healthData: null
      };
    }
  }

  public static async fetchHealth(): Promise<AdminHealthData> {
    const token = this.getStoredToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/admin/health`, { headers });
    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      const msg = errBody?.error?.message || errBody?.message || `HTTP ${res.status}`;
      if (res.status === 401 || res.status === 403) {
        throw new Error(`AUTH_REQUIRED:${res.status}:${msg}`);
      }
      throw new Error(`BACKEND_ERROR:${res.status}:${msg}`);
    }
    const json = await res.json();
    return json.data;
  }

  public static async fetchMetrics(): Promise<AdminMetricsData> {
    const token = this.getStoredToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/admin/metrics`, { headers });
    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      const msg = errBody?.error?.message || errBody?.message || `HTTP ${res.status}`;
      if (res.status === 401 || res.status === 403) {
        throw new Error(`AUTH_REQUIRED:${res.status}:${msg}`);
      }
      throw new Error(`BACKEND_ERROR:${res.status}:${msg}`);
    }
    const json = await res.json();
    return json.data;
  }

  public static async fetchAuditLogs(limit = 50): Promise<AdminAuditLogEntry[]> {
    const token = this.getStoredToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/admin/audit-logs?limit=${limit}`, { headers });
    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      const msg = errBody?.error?.message || errBody?.message || `HTTP ${res.status}`;
      if (res.status === 401 || res.status === 403) {
        throw new Error(`AUTH_REQUIRED:${res.status}:${msg}`);
      }
      throw new Error(`BACKEND_ERROR:${res.status}:${msg}`);
    }
    const json = await res.json();
    return json.data;
  }

  /**
   * Fallback mock data generator for offline / demonstration preview
   */
  public static getFallbackHealth(): AdminHealthData {
    return {
      services: {
        api: 'online',
        database: 'connected',
        redis: 'active',
        aiProxy: 'healthy'
      },
      system: {
        uptimeSeconds: 259120,
        uptimeFormatted: '3d 0h 12m (99.98% 30d)',
        processMemory: {
          heapUsedMB: 78,
          heapTotalMB: 142,
          rssMB: 198
        },
        cpuUtilizationPercent: 24.5,
        nodeVersion: 'v22.12.0',
        environment: 'production'
      },
      database: {
        status: 'connected',
        readyState: 1,
        activeConnections: 14,
        poolSize: 50
      },
      timestamp: new Date().toISOString()
    };
  }

  public static getFallbackMetrics(): AdminMetricsData {
    return {
      macroAnalytics: {
        totalUsers: 2410,
        dau: 480,
        mau: 1840,
        totalAssessments: 3820,
        distribution: {
          lowRiskPercentage: 45,
          moderateRiskPercentage: 38,
          highRiskPercentage: 17,
          privacyGuaranteed: true,
          sampleSize: 3820
        },
        wearableAdoptionRate: 42
      },
      apiTelemetry: {
        totalRequests24h: 184290,
        avgLatencyMs: 58,
        p50LatencyMs: 44,
        p95LatencyMs: 142,
        p99LatencyMs: 215,
        statusCodeDistribution: {
          '2xx': 178200,
          '3xx': 4120,
          '4xx': 1935,
          '5xx': 35
        },
        errorRate5xxPercentage: 0.02,
        mobileEndpoints: [
          {
            routeGroup: 'Assessment Engine',
            routePrefix: '/api/v1/assessments',
            method: 'POST',
            totalCalls: 3820,
            avgLatencyMs: 64,
            lastStatusCode: 201,
            errorCount: 2,
            lastActive: new Date(Date.now() - 120000).toISOString(),
            status: 'operational'
          },
          {
            routeGroup: 'Wearable Sync',
            routePrefix: '/api/v1/wearables/sync',
            method: 'POST',
            totalCalls: 1240,
            avgLatencyMs: 48,
            lastStatusCode: 200,
            errorCount: 0,
            lastActive: new Date(Date.now() - 300000).toISOString(),
            status: 'operational'
          },
          {
            routeGroup: 'Guidance Hub',
            routePrefix: '/api/v1/recommendations/current',
            method: 'GET',
            totalCalls: 4910,
            avgLatencyMs: 42,
            lastStatusCode: 200,
            errorCount: 1,
            lastActive: new Date(Date.now() - 60000).toISOString(),
            status: 'operational'
          },
          {
            routeGroup: 'Auth & Sessions',
            routePrefix: '/api/v1/auth/login',
            method: 'POST',
            totalCalls: 2150,
            avgLatencyMs: 78,
            lastStatusCode: 200,
            errorCount: 5,
            lastActive: new Date(Date.now() - 45000).toISOString(),
            status: 'operational'
          },
          {
            routeGroup: 'Reminders Scheduler',
            routePrefix: '/api/v1/reminders',
            method: 'GET',
            totalCalls: 890,
            avgLatencyMs: 38,
            lastStatusCode: 200,
            errorCount: 0,
            lastActive: new Date(Date.now() - 180000).toISOString(),
            status: 'operational'
          },
          {
            routeGroup: 'Patient Profile',
            routePrefix: '/api/v1/users/profile',
            method: 'GET',
            totalCalls: 3120,
            avgLatencyMs: 35,
            lastStatusCode: 200,
            errorCount: 0,
            lastActive: new Date(Date.now() - 90000).toISOString(),
            status: 'operational'
          }
        ]
      },
      recentErrorStream: [
        {
          id: 'err_demo_1',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          method: 'POST',
          route: '/api/v1/assessments',
          statusCode: 500,
          message: 'Database connection retry attempt 1/5 timed out',
          sanitizedStackTrace: 'at DatabaseManager.connect (src/core/database/mongooseConnection.ts:38:15)\nat processTicksAndRejections (node:internal/process/task_queues:104:5)'
        },
        {
          id: 'err_demo_2',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          method: 'POST',
          route: '/api/v1/auth/login',
          statusCode: 429,
          message: 'Rate limit threshold reached for IP subnet',
          sanitizedStackTrace: 'at rateLimitMiddleware (src/core/middleware/rateLimiter.ts:24:9)'
        }
      ],
      privacySafeguard: {
        isZeroPhiCompliant: true,
        policy: 'Strict Zero-PHI Protocol: Patient identities, symptoms, scores and biometrics are architecturally blocked.'
      },
      timestamp: new Date().toISOString()
    };
  }

  public static getFallbackAuditLogs(): AdminAuditLogEntry[] {
    return [
      {
        _id: 'audit_1',
        adminEmail: 'sysadmin@vitatrack.com',
        action: 'ADMIN_LOGIN_SUCCESS',
        ipAddress: '192.168.1.10',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        status: 'SUCCESS',
        details: 'Admin logged in via MFA session.',
        timestamp: new Date(Date.now() - 1800000).toISOString()
      },
      {
        _id: 'audit_2',
        adminEmail: 'sysadmin@vitatrack.com',
        action: 'TELEMETRY_REFRESH',
        ipAddress: '192.168.1.10',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        status: 'SUCCESS',
        details: 'Polled macro metrics and server health.',
        timestamp: new Date(Date.now() - 900000).toISOString()
      }
    ];
  }
}
