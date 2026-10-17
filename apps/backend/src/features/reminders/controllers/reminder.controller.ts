import { Request, Response, NextFunction } from 'express';
import { ReminderService } from '../services/reminder.service';
import { updateReminderPreferencesSchema } from '../validators/reminder.validator';
import { AppError } from '../../../core/middleware/errorHandler';

export class ReminderController {
  /**
   * GET /api/v1/reminders
   * Retrieve notification and reminder preferences for the authenticated user
   */
  public static async getPreferences(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized access.', 401);
      }

      const prefs = await ReminderService.getPreferences(req.user.userId);

      res.status(200).json({
        success: true,
        data: prefs
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/reminders
   * Update notification and reminder preferences for the authenticated user
   */
  public static async updatePreferences(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized access.', 401);
      }

      const parsed = updateReminderPreferencesSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: parsed.error.flatten().fieldErrors,
            statusCode: 400
          }
        });
        return;
      }

      const updated = await ReminderService.updatePreferences(req.user.userId, parsed.data);

      res.status(200).json({
        success: true,
        message: 'Reminder preferences updated successfully.',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/reminders/test
   * Generates a context-aware test notification payload for preview or local trigger
   */
  public static async testNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized access.', 401);
      }

      const type = (req.body?.type as any) || 'test';
      const payload = ReminderService.generateNotificationContent(type, {
        durationMinutes: req.body?.durationMinutes,
        intervalDays: req.body?.intervalDays
      });

      res.status(200).json({
        success: true,
        message: 'Test notification payload synthesized successfully.',
        data: payload
      });
    } catch (error) {
      next(error);
    }
  }
}
