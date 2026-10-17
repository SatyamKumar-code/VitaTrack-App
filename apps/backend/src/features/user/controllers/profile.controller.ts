import { Request, Response, NextFunction } from 'express';
import { ProfileService } from '../services/profile.service';
import { updateProfileSchema } from '../validators/profile.validator';
import { AppError } from '../../../core/middleware/errorHandler';

export class ProfileController {
  public static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized access.', 401);
      }

      const profile = await ProfileService.getProfile(req.user.userId);

      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized access.', 401);
      }

      const parsed = updateProfileSchema.safeParse(req.body);
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

      const updated = await ProfileService.updateProfile(req.user.userId, parsed.data);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
}
