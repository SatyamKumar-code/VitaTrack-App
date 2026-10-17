import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../../features/auth/utils/token.utils';
import { User } from '../../features/auth/models/user.model';
import { AppError } from './errorHandler';

export interface AuthenticatedUser {
  userId: string;
  role: 'patient' | 'admin';
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authorization token required.', 401);
    }

    const token = authHeader.split(' ')[1];
    let payload: TokenPayload;

    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new AppError('Invalid or expired authentication token.', 401);
    }

    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new AppError('User session expired or account deactivated.', 401);
    }

    // Token version check: If user logged out or invalidated sessions, reject token
    if (user.tokenVersion !== payload.tokenVersion) {
      throw new AppError('Session invalidated. Please log in again.', 401);
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email
    };

    next();
  } catch (error) {
    next(error);
  }
}
