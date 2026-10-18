import { Request, Response, NextFunction } from 'express';

/**
 * Recursively cleans an object by removing any keys starting with '$' or containing '.'
 * to prevent NoSQL query injection attacks.
 */
export function sanitizeNoSql(target: unknown): unknown {
  if (!target || typeof target !== 'object') {
    return target;
  }

  if (Array.isArray(target)) {
    return target.map(sanitizeNoSql);
  }

  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(target as Record<string, unknown>)) {
    // Drop keys that start with $ or contain .
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    if (value && typeof value === 'object') {
      cleaned[key] = sanitizeNoSql(value);
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

/**
 * Middleware for HTTP Parameter Pollution (HPP) protection and NoSQL injection prevention.
 */
export function inputSanitizer(req: Request, res: Response, next: NextFunction): void {
  try {
    // 1. Sanitize Body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeNoSql(req.body);
    }

    // 2. Sanitize Query parameters and prevent parameter pollution
    if (req.query && typeof req.query === 'object') {
      // HPP: For non-array parameters, if an array is supplied, take the last element
      const sanitizedQuery: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(req.query)) {
        if (key.startsWith('$') || key.includes('.')) {
          continue;
        }
        if (Array.isArray(val)) {
          // Keep the last value to prevent parameter pollution unless parameter is expected as array
          sanitizedQuery[key] = val[val.length - 1];
        } else {
          sanitizedQuery[key] = val;
        }
      }
      req.query = sanitizedQuery as any;
    }

    // 3. Sanitize Params
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeNoSql(req.params) as any;
    }

    next();
  } catch (error) {
    next(error);
  }
}
