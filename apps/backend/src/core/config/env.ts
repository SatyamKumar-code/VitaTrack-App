import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 1. Locate and load the .env file strictly from project paths
const candidateEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(__dirname, '../../../../../.env'),
  path.resolve(__dirname, '../../../../.env'),
  path.resolve(__dirname, '../../../.env')
];

let loadedEnvPath: string | null = null;
for (const p of candidateEnvPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    loadedEnvPath = p;
    break;
  }
}

// 2. Alert if .env file itself is missing and not already injected via environment (e.g. Docker)
if (!loadedEnvPath && !process.env.MONGO_URI) {
  const missingFileAlert = `
================================================================================
🚨 [ALERT: .ENV FILE NOT FOUND]
No .env file was found in any of the expected directories:
${candidateEnvPaths.map((p) => `  - ${p}`).join('\n')}

Please create a .env file (you can copy from .env.example) and define the required variables.
================================================================================
`;
  console.error(missingFileAlert);
}

// 3. Define all mandatory environment variables that MUST be set in .env
const REQUIRED_ENV_VARS = [
  'NODE_ENV',
  'PORT',
  'API_PREFIX',
  'MONGO_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET'
] as const;

// 4. Verify each variable; collect any missing ones
const missingVariables: string[] = [];
for (const varName of REQUIRED_ENV_VARS) {
  const val = process.env[varName];
  if (!val || val.trim() === '') {
    missingVariables.push(varName);
  }
}

// 5. If any variable is missing, alert which variables are not set and exit cleanly (without stack trace)
if (missingVariables.length > 0) {
  const alertBanner = `
================================================================================
🚨 [ALERT: MISSING ENVIRONMENT VARIABLES IN .ENV]
The following required environment variable(s) are NOT SET in your .env file:
${missingVariables.map((v) => `  ❌ ${v} -> Not configured in .env`).join('\n')}

📁 Loaded .env location: ${loadedEnvPath || 'NONE'}
👉 Solution: Open your .env file and set the missing variable(s) listed above.
================================================================================
`;
  console.error(alertBanner);

  if (process.env.NODE_ENV === 'test') {
    throw new Error(
      `[ENV CONFIG ERROR] Missing required variable(s) in .env: ${missingVariables.join(', ')}`
    );
  } else {
    process.exit(1);
  }
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  mongoUri: string;
  corsOrigin: string[];
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  loadedEnvPath: string | null;
  redisUrl?: string;
  redisHost: string;
  redisPort: number;
  redisPassword?: string;
}

export const config: AppConfig = {
  nodeEnv: (process.env.NODE_ENV || '').trim(),
  port: parseInt((process.env.PORT || '0').trim(), 10),
  apiPrefix: (process.env.API_PREFIX || '').trim(),
  mongoUri: (process.env.MONGO_URI || '').trim(),
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : ['http://localhost:5173', 'http://localhost:8081'],
  jwtAccessSecret: (process.env.JWT_ACCESS_SECRET || '').trim(),
  jwtRefreshSecret: (process.env.JWT_REFRESH_SECRET || '').trim(),
  loadedEnvPath,
  redisUrl: process.env.REDIS_URL?.trim() || undefined,
  redisHost: process.env.REDIS_HOST?.trim() || '127.0.0.1',
  redisPort: parseInt(process.env.REDIS_PORT?.trim() || '6379', 10),
  redisPassword: process.env.REDIS_PASSWORD?.trim() || undefined
};
