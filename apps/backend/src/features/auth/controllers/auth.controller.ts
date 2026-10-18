import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema
} from '../validators/auth.validator';

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = registerSchema.safeParse(req.body);
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

      const result = await AuthService.register(parsed.data);

      res.status(201).json({
        success: true,
        message: 'User registered successfully.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
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

      const result = await AuthService.login(parsed.data);

      res.status(200).json({
        success: true,
        message: 'Authentication successful.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  public static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = refreshTokenSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Refresh token is required in request body.',
            statusCode: 400
          }
        });
        return;
      }

      const tokens = await AuthService.rotateRefreshToken(parsed.data.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Tokens rotated successfully.',
        data: { tokens }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.body?.refreshToken;
      const userId = req.user?.userId;

      // Revoke access token immediately in Redis (Spec §6.1 / token:blacklist:{jti})
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const { RedisManager } = await import('../../../core/cache/redisClient');
        await RedisManager.blacklistToken(token, 900); // 15-minute access token lifespan
      }

      await AuthService.logout(refreshToken, userId);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  public static async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const parsed = forgotPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Valid email is required',
            statusCode: 400
          }
        });
        return;
      }

      const result = await AuthService.forgotPassword(parsed.data.email);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}
