import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger/logger';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  logger.error(`[${req.method}] ${req.originalUrl} - Status: ${statusCode}`, err);

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode
    }
  });
}
