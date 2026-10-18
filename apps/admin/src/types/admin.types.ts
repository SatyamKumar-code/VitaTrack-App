export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'admin';
}

export interface AdminHealthData {
  services: {
    api: 'online' | 'degraded' | 'offline';
    database: string;
    redis: 'active' | 'standby';
    aiProxy: 'healthy' | 'degraded';
  };
  system: {
    uptimeSeconds: number;
    uptimeFormatted: string;
    processMemory: {
      heapUsedMB: number;
      heapTotalMB: number;
      rssMB: number;
    };
    cpuUtilizationPercent: number;
    nodeVersion: string;
    environment: string;
  };
  database: {
    status: string;
    readyState: number;
    activeConnections: number;
    poolSize: number;
  };
  timestamp: string;
}

export interface SanitizedErrorLog {
  id: string;
  timestamp: string;
  method: string;
  route: string;
  statusCode: number;
  message: string;
  isMobileEndpoint?: boolean;
  sanitizedStackTrace?: string;
}

export interface MobileEndpointMetric {
  routeGroup: string;
  routePrefix: string;
  method: string;
  totalCalls: number;
  avgLatencyMs: number;
  lastStatusCode: number;
  errorCount: number;
  lastActive: string | null;
  status: 'operational' | 'degraded' | 'idle';
}

export interface MacroPopulationMetrics {
  totalUsers: number;
  dau: number;
  mau: number;
  totalAssessments: number;
  distribution: {
    lowRiskPercentage: number | null;
    moderateRiskPercentage: number | null;
    highRiskPercentage: number | null;
    privacyGuaranteed: boolean;
    sampleSize: number;
    privacyNotice?: string;
  };
  wearableAdoptionRate: number;
}

export interface ApiTelemetryStats {
  totalRequests24h: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  statusCodeDistribution: {
    '2xx': number;
    '3xx': number;
    '4xx': number;
    '5xx': number;
  };
  errorRate5xxPercentage: number;
  mobileEndpoints?: MobileEndpointMetric[];
}

export interface AdminMetricsData {
  macroAnalytics: MacroPopulationMetrics;
  apiTelemetry: ApiTelemetryStats;
  recentErrorStream: SanitizedErrorLog[];
  privacySafeguard: {
    isZeroPhiCompliant: boolean;
    policy: string;
  };
  timestamp: string;
}

export interface AdminAuditLogEntry {
  _id: string;
  adminEmail: string;
  action: string;
  ipAddress: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILURE';
  details?: string;
  timestamp: string;
}
