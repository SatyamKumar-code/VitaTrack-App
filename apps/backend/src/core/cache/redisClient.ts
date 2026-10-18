import Redis, { RedisOptions } from 'ioredis';
import { config } from '../config/env';
import { logger } from '../logger/logger';

interface CacheEntry<T = any> {
  value: T;
  expiresAt: number | null; // null means no expiration
}

/**
 * High-Availability Redis Manager with Seamless In-Memory Standby Fallback
 * Complies with VitaTrack Phase E Scalability Spec (docs/HUMAN_UI_GUEST_REVAMP_SPEC.md §6.1)
 */
export class RedisManager {
  private static client: Redis | null = null;
  private static status: 'active' | 'standby' = 'standby';
  private static memoryFallback: Map<string, CacheEntry> = new Map();
  private static cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Initializes Redis connection. If connection fails or Redis is not running,
   * switches gracefully to in-memory fallback without throwing exceptions.
   */
  public static async connect(customOptions?: RedisOptions): Promise<boolean> {
    // Avoid double initialization
    if (this.client && this.status === 'active') {
      return true;
    }

    // Start in-memory cleanup timer once
    if (!this.cleanupInterval) {
      this.cleanupInterval = setInterval(() => this.purgeExpiredMemoryKeys(), 60000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }

    // If no explicit Redis URL or host is specified in environment, operate immediately in standby mode
    if (!config.redisUrl && !process.env.REDIS_HOST && !process.env.REDIS_URL) {
      logger.info('No REDIS_URL configured. Operating in High-Performance Standby Memory Mode (100% Free).');
      this.status = 'standby';
      return false;
    }

    try {
      const redisOptions: RedisOptions = customOptions || {
        host: config.redisHost,
        port: config.redisPort,
        password: config.redisPassword,
        lazyConnect: true,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
        connectTimeout: 2500,
        retryStrategy: (times: number) => {
          if (times > 3) {
            return null; // Stop retrying and fallback to memory
          }
          return Math.min(times * 300, 1500);
        }
      };

      if (config.redisUrl) {
        const isTls = config.redisUrl.startsWith('rediss://');
        this.client = new Redis(config.redisUrl, {
          lazyConnect: true,
          enableOfflineQueue: false,
          maxRetriesPerRequest: 2,
          connectTimeout: 7500,
          ...(isTls ? { tls: { rejectUnauthorized: false } } : {})
        });
      } else {
        this.client = new Redis(redisOptions);
      }

      this.client.on('error', (err) => {
        if (this.status === 'active') {
          logger.warn(`Redis connection degraded. Falling back to in-memory cache: ${err.message}`);
          this.status = 'standby';
        }
      });

      this.client.on('connect', () => {
        logger.info('Redis connection established successfully.');
        this.status = 'active';
      });

      this.client.on('close', () => {
        this.status = 'standby';
      });

      await this.client.connect();
      this.status = 'active';
      logger.info(`Redis cache active at ${config.redisHost}:${config.redisPort}`);
      return true;
    } catch (err: any) {
      logger.info(`Redis unavailable (${err?.message || 'offline'}). Operating in Standby Memory Mode.`);
      this.status = 'standby';
      return false;
    }
  }

  /**
   * Disconnects Redis client cleanly
   */
  public static async disconnect(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        this.client.disconnect();
      }
      this.client = null;
    }
    this.status = 'standby';
    this.memoryFallback.clear();
  }

  /**
   * Current status of Redis cluster / adapter
   */
  public static getStatus(): 'active' | 'standby' {
    return this.status;
  }

  /**
   * Returns underlying ioredis client or null if not active
   */
  public static getClient(): Redis | null {
    return this.status === 'active' ? this.client : null;
  }

  /**
   * Check if Redis is connected and ready
   */
  public static isReady(): boolean {
    return this.status === 'active' && this.client !== null && this.client.status === 'ready';
  }

  /**
   * Retrieves item from cache (Redis or in-memory fallback)
   */
  public static async get<T = any>(key: string): Promise<T | null> {
    if (this.status === 'active' && this.client) {
      try {
        const raw = await this.client.get(key);
        if (!raw) return null;
        try {
          return JSON.parse(raw) as T;
        } catch {
          return raw as unknown as T;
        }
      } catch (err: any) {
        logger.warn(`Redis GET failed for key "${key}", checking fallback: ${err.message}`);
      }
    }

    // Memory Fallback
    const entry = this.memoryFallback.get(key);
    if (!entry) return null;

    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.memoryFallback.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Sets value in cache with optional TTL in seconds
   */
  public static async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);

    if (this.status === 'active' && this.client) {
      try {
        if (ttlSeconds && ttlSeconds > 0) {
          await this.client.set(key, serialized, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, serialized);
        }
        return;
      } catch (err: any) {
        logger.warn(`Redis SET failed for key "${key}", routing to fallback: ${err.message}`);
      }
    }

    // Memory Fallback
    const expiresAt = ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryFallback.set(key, { value, expiresAt });
  }

  /**
   * Deletes a key from cache
   */
  public static async del(key: string): Promise<void> {
    if (this.status === 'active' && this.client) {
      try {
        await this.client.del(key);
      } catch (err: any) {
        logger.warn(`Redis DEL failed for key "${key}": ${err.message}`);
      }
    }
    this.memoryFallback.delete(key);
  }

  /**
   * Flushes all stored cache keys (Useful for testing)
   */
  public static async flushAll(): Promise<void> {
    if (this.status === 'active' && this.client) {
      try {
        await this.client.flushdb();
      } catch (err: any) {
        logger.warn(`Redis FLUSHDB failed: ${err.message}`);
      }
    }
    this.memoryFallback.clear();
  }

  // --- Domain-Specific Cache Key Generators & Helpers (Spec §6.1) ---

  /**
   * Generates standardized UV cache key for coordinates (rounded to 2 decimal places)
   * Pattern: `uv:cache:{lat}:{lon}` (TTL: 3600s / 1hr)
   */
  public static getUvKey(lat: number, lon: number): string {
    const roundedLat = Number(lat).toFixed(2);
    const roundedLon = Number(lon).toFixed(2);
    return `uv:cache:${roundedLat}:${roundedLon}`;
  }

  /**
   * Generates standardized token blacklist key
   * Pattern: `token:blacklist:{jti}`
   */
  public static getTokenBlacklistKey(tokenOrJti: string): string {
    // If entire token is provided, extract last 32 chars as stable fingerprint
    const keyId = tokenOrJti.length > 32 ? tokenOrJti.slice(-32) : tokenOrJti;
    return `token:blacklist:${keyId}`;
  }

  /**
   * Generates standardized diet content cache key
   * Pattern: `content:diet:{category}` (TTL: 86400s / 24hr)
   */
  public static getDietContentKey(category: string): string {
    return `content:diet:${category.toLowerCase().trim()}`;
  }

  /**
   * Add token to blacklist with TTL (defaults to 15 minutes / 900s)
   */
  public static async blacklistToken(token: string, ttlSeconds: number = 900): Promise<void> {
    const key = this.getTokenBlacklistKey(token);
    await this.set(key, { revokedAt: new Date().toISOString() }, ttlSeconds);
  }

  /**
   * Check if token is present in blacklist
   */
  public static async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = this.getTokenBlacklistKey(token);
    const result = await this.get(key);
    return result !== null;
  }

  /**
   * Periodically purges expired keys in standby memory mode
   */
  private static purgeExpiredMemoryKeys(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryFallback.entries()) {
      if (entry.expiresAt !== null && now > entry.expiresAt) {
        this.memoryFallback.delete(key);
      }
    }
  }
}
