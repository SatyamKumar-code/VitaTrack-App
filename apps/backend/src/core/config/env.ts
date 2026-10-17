import dotenv from 'dotenv';
import path from 'path';

// Load .env file from current working directory, backend folder, or project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../../.env') });

export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  mongoUri: string;
  corsOrigin: string[];
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
}

export const config: AppConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/vitasun',
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : ['http://localhost:5173', 'http://localhost:8081'],
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_do_not_use_in_prod',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_do_not_use_in_prod'
};
