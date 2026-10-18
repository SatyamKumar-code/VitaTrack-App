import { Request, Response, NextFunction } from 'express';
import { WearableService } from '../services/wearable.service';
import { wearableSyncSchema } from '../validators/wearable.validator';
import { AppError } from '../../../core/middleware/errorHandler';

export class WearableController {
  /**
   * POST /api/v1/wearables/sync
   * Ingest and normalize daily biometric records synced from Android Health Connect
   */
  public static async sync(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized access.', 401);
      }

      const parsed = wearableSyncSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Physiological or schema validation failed for biometric payload.',
            details: parsed.error.flatten().fieldErrors,
            statusCode: 400
          }
        });
        return;
      }

      const result = await WearableService.syncMetrics(req.user.userId, parsed.data);

      res.status(200).json({
        success: true,
        message: 'Wearable biometrics synced and normalized successfully.',
        data: {
          syncedAt: result.syncedAt,
          metric: result.metric
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/wearables/latest
   * Retrieve the most recent biometric sync entry for authenticated user
   */
  public static async getLatest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized access.', 401);
      }

      const latest = await WearableService.getLatestMetrics(req.user.userId);

      res.status(200).json({
        success: true,
        data: latest
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/wearables/history
   * Retrieve historical daily metrics for user (e.g. last 7 to 30 days)
   */
  public static async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized access.', 401);
      }

      const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
      const history = await WearableService.getMetricsHistory(req.user.userId, days);

      res.status(200).json({
        success: true,
        count: history.length,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/wearables/insights
   * TASK-P8-06: Correlate wearable activity and sleep data with fatigue scores
   */
  public static async getInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized access.', 401);
      }

      const insights = await WearableService.getCorrelationInsights(req.user.userId);

      res.status(200).json({
        success: true,
        data: insights
      });
    } catch (error) {
      next(error);
    }
  }
}
