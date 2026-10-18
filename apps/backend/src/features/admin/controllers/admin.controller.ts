import { Request, Response, NextFunction } from 'express';
import { AdminTelemetryService } from '../services/adminTelemetry.service';
import { adminLoginSchema } from '../validators/admin.validator';

export class AdminController {
  public static async getHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AdminTelemetryService.getHealth();
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AdminTelemetryService.getMetrics();
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = adminLoginSchema.parse(req.body);
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'VitaTrack-Admin-Client';

      const data = await AdminTelemetryService.adminLogin(
        parsed.email,
        parsed.password,
        ipAddress,
        userAgent
      );

      res.status(200).json({
        success: true,
        message: 'Administrator authenticated successfully.',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const data = await AdminTelemetryService.getAuditLogs(limit);
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }
}
