import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Check if rate limiting should be skipped during tests unless explicitly forced
const shouldSkip = (req: Request) => {
  if (process.env.NODE_ENV === 'test' && req.headers['x-test-rate-limit'] !== 'true') {
    return true;
  }
  return false;
};

/**
 * Auth Rate Limiter
 * Capped at 5 attempts per IP per 15 minutes for sensitive authentication endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: shouldSkip,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many authentication attempts. Please try again after 15 minutes.',
        statusCode: 429
      }
    });
  }
});

/**
 * General API Rate Limiter
 * Capped at 100 requests per minute per IP / client for standard REST APIs
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkip,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests. Please slow down.',
        statusCode: 429
      }
    });
  }
});
