const SENSITIVE_KEYS = [
  'password',
  'token',
  'refreshToken',
  'accessToken',
  'symptoms',
  'fatigueLevel',
  'bonePainLevel',
  'scoringResults',
  'stepCount',
  'restingHeartRate',
  'avgSpO2',
  'sleepDurationMinutes'
];

export function sanitizeLogData(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map(sanitizeLogData);
  }
  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.includes(key)) {
      sanitized[key] = '[REDACTED_SECURE_PHI]';
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = sanitizeLogData(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

export const logger = {
  info: (message: string, meta?: unknown): void => {
    const timestamp = new Date().toISOString();
    if (meta) {
      console.log(`[${timestamp}] [INFO] ${message}`, JSON.stringify(sanitizeLogData(meta)));
    } else {
      console.log(`[${timestamp}] [INFO] ${message}`);
    }
  },
  warn: (message: string, meta?: unknown): void => {
    const timestamp = new Date().toISOString();
    if (meta) {
      console.warn(`[${timestamp}] [WARN] ${message}`, JSON.stringify(sanitizeLogData(meta)));
    } else {
      console.warn(`[${timestamp}] [WARN] ${message}`);
    }
  },
  error: (message: string, error?: unknown): void => {
    const timestamp = new Date().toISOString();
    if (error instanceof Error) {
      console.error(`[${timestamp}] [ERROR] ${message}: ${error.message}\n${error.stack}`);
    } else if (error) {
      console.error(`[${timestamp}] [ERROR] ${message}`, JSON.stringify(sanitizeLogData(error)));
    } else {
      console.error(`[${timestamp}] [ERROR] ${message}`);
    }
  }
};
