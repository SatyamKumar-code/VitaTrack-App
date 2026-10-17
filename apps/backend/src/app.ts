import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './core/config/env';
import { errorHandler } from './core/middleware/errorHandler';
import { DatabaseManager } from './core/database/mongooseConnection';
import { logger } from './core/logger/logger';
import { authRouter } from './features/auth/routes/auth.routes';
import { userRouter } from './features/user/routes/user.routes';
import { assessmentRouter } from './features/assessment/routes/assessment.routes';
import { guidanceRouter } from './features/guidance/routes/guidance.routes';

export function createApp(): Application {
  const app = express();

  // Security & HTTP headers
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true
    })
  );

  // Request body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Basic request logging
  app.use((req: Request, res: Response, next) => {
    logger.info(`[${req.method}] ${req.path}`);
    next();
  });

  // Health check response generator
  const getHealthStatus = () => {
    const dbStatus = DatabaseManager.getStatus();
    return {
      status: 'ok',
      service: 'VitaTrack API',
      version: '0.1.0',
      phase: 'Phase 1 - Foundation & Tooling',
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
      uptimeSeconds: parseFloat(process.uptime().toFixed(2)),
      database: {
        status: dbStatus.isConnected ? 'connected' : 'disconnected',
        readyState: dbStatus.readyState
      }
    };
  };

  // Health check routes (available at both root and api prefix)
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json(getHealthStatus());
  });

  app.get(`${config.apiPrefix}/health`, (req: Request, res: Response) => {
    res.status(200).json(getHealthStatus());
  });

  // Feature Routes (Phase 2, 3, 4 & 5)
  app.use(`${config.apiPrefix}/auth`, authRouter);
  app.use(`${config.apiPrefix}/users`, userRouter);
  app.use(`${config.apiPrefix}/assessments`, assessmentRouter);
  app.use(`${config.apiPrefix}/recommendations`, guidanceRouter);

  // 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        message: `Route ${req.method} ${req.originalUrl} not found on VitaTrack API.`,
        statusCode: 404
      }
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
