import { createApp } from './app';
import { config } from './core/config/env';
import { DatabaseManager } from './core/database/mongooseConnection';
import { logger } from './core/logger/logger';

async function bootstrap() {
  const app = createApp();

  // Attempt database connection in background so app starts even if DB is spinning up
  DatabaseManager.connect({
    uri: config.mongoUri,
    maxRetries: 3,
    retryIntervalMs: 2000
  })
    .then(async (connected) => {
      if (connected) {
        const { ensureDefaultAdminExists } = await import('./features/admin/utils/seedAdmin');
        await ensureDefaultAdminExists();
      }
    })
    .catch((err) => {
      logger.warn('Initial MongoDB connection deferred:', err);
    });

  const server = app.listen(config.port, () => {
    logger.info(`===============================================`);
    logger.info(`  VitaTrack Backend API running in [${config.nodeEnv}]`);
    logger.info(`  Listening on: http://localhost:${config.port}`);
    logger.info(`  Health check: http://localhost:${config.port}/health`);
    logger.info(`  API Prefix:   ${config.apiPrefix}`);
    logger.info(`===============================================`);
  });

  // Graceful shutdown handlers
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      await DatabaseManager.disconnect();
      process.exit(0);
    });

    // Force exit after 10 seconds if graceful shutdown hangs
    setTimeout(() => {
      logger.error('Forceful shutdown triggered after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Fatal bootstrap error:', err);
  process.exit(1);
});
