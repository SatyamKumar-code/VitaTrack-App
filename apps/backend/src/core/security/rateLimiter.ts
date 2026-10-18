import rateLimit, { MemoryStore, Store, Options, IncrementResponse } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { Request, Response } from 'express';
import { RedisManager } from '../cache/redisClient';
import { logger } from '../logger/logger';

/**
 * Adaptive Rate Limit Store
 * Operates across Redis in-memory cluster when active (`rate:ip:{ip}` per spec §6.1).
 * Seamlessly fails over to MemoryStore if Redis is offline or degraded.
 */
export class AdaptiveRedisRateLimitStore implements Store {
  private memoryStore: Store;
  private redisStore: Store | null = null;
  public prefix: string;
  private options?: Options;

  constructor(prefix: string) {
    this.prefix = prefix;
    this.memoryStore = new MemoryStore();
  }

  public init(options: Options): void {
    this.options = options;
    if (this.memoryStore.init) {
      this.memoryStore.init(options);
    }
    this.ensureRedisStore();
  }

  private ensureRedisStore(): Store | null {
    if (RedisManager.isReady() && RedisManager.getClient()) {
      if (!this.redisStore) {
        try {
          const client = RedisManager.getClient()!;
          this.redisStore = new RedisStore({
            sendCommand: async (...args: string[]) => {
              return (await client.call(args[0], ...args.slice(1))) as any;
            },
            prefix: this.prefix
          });
          if (this.options && this.redisStore.init) {
            this.redisStore.init(this.options);
          }
        } catch (err: any) {
          logger.warn(`Failed instantiating Redis rate limit store: ${err.message}`);
          this.redisStore = null;
        }
      }
      return this.redisStore;
    }
    return null;
  }

  public async increment(key: string): Promise<IncrementResponse> {
    const store = this.ensureRedisStore();
    if (store) {
      try {
        return await store.increment(key);
      } catch (err: any) {
        logger.warn(`Redis rate limit increment failed for ${key}, falling back to memory: ${err.message}`);
      }
    }
    return await this.memoryStore.increment(key);
  }

  public async decrement(key: string): Promise<void> {
    const store = this.ensureRedisStore();
    if (store) {
      try {
        await store.decrement(key);
        return;
      } catch (err: any) {
        logger.warn(`Redis rate limit decrement failed for ${key}: ${err.message}`);
      }
    }
    await this.memoryStore.decrement(key);
  }

  public async resetKey(key: string): Promise<void> {
    const store = this.ensureRedisStore();
    if (store) {
      try {
        await store.resetKey(key);
      } catch (err: any) {
        logger.warn(`Redis rate limit resetKey failed: ${err.message}`);
      }
    }
    await this.memoryStore.resetKey(key);
  }

  public async resetAll(): Promise<void> {
    if (this.memoryStore.resetAll) {
      await this.memoryStore.resetAll();
    }
    if (this.redisStore && this.redisStore.resetAll) {
      try {
        await this.redisStore.resetAll();
      } catch (err: any) {
        logger.warn(`Redis rate limit resetAll failed: ${err.message}`);
      }
    }
  }
}

// Check if rate limiting should be skipped during tests unless explicitly forced
const shouldSkip = (req: Request) => {
  if (process.env.NODE_ENV === 'test' && req.headers['x-test-rate-limit'] !== 'true') {
    return true;
  }
  return false;
};

/**
 * Auth Rate Limiter
 * Pattern: `rate:ip:auth:{ip}` (Capped at 5 attempts per 15 minutes)
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: shouldSkip,
  store: new AdaptiveRedisRateLimitStore('rate:ip:auth:'),
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
 * Pattern: `rate:ip:api:{ip}` (Capped at 100 requests per minute per IP / client)
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkip,
  store: new AdaptiveRedisRateLimitStore('rate:ip:api:'),
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
