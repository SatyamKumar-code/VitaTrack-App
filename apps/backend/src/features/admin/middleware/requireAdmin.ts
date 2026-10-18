import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../core/middleware/errorHandler';

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }

  if (req.user.role !== 'admin') {
    return next(new AppError('Access denied. Administrative role required.', 403));
  }

  next();
}
