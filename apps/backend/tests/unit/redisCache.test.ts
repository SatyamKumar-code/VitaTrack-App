import { RedisManager } from '../../src/core/cache/redisClient';

describe('Phase E: Redis Cache Manager & Standby Memory Fallback Unit Suite', () => {
  beforeEach(async () => {
    await RedisManager.flushAll();
  });

  afterAll(async () => {
    await RedisManager.disconnect();
  });

  describe('Key Generation & Schema Invariants (Spec §6.1)', () => {
    it('should generate standardized UV cache key rounded to 2 decimal places', () => {
      const key = RedisManager.getUvKey(37.774929, -122.419416);
      expect(key).toBe('uv:cache:37.77:-122.42');
    });

    it('should generate standardized token blacklist key', () => {
      const key = RedisManager.getTokenBlacklistKey('sample-jwt-token-string-xyz-1234567890');
      expect(key).toContain('token:blacklist:');
    });

    it('should generate standardized diet content cache key in lowercase', () => {
      const key = RedisManager.getDietContentKey('VEGAN');
      expect(key).toBe('content:diet:vegan');
    });
  });

  describe('Cache Operations (Get, Set, Del, FlushAll)', () => {
    it('should return null for non-existent cache keys', async () => {
      const val = await RedisManager.get('non:existent:key');
      expect(val).toBeNull();
    });

    it('should store and retrieve primitives and structured objects', async () => {
      const sample = { uvIndex: 5.2, category: 'Moderate', verified: true };
      await RedisManager.set('test:sample', sample, 60);

      const retrieved = await RedisManager.get<typeof sample>('test:sample');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.uvIndex).toBe(5.2);
      expect(retrieved?.category).toBe('Moderate');
      expect(retrieved?.verified).toBe(true);
    });

    it('should delete keys properly', async () => {
      await RedisManager.set('test:del', 'to-be-deleted', 60);
      await RedisManager.del('test:del');

      const val = await RedisManager.get('test:del');
      expect(val).toBeNull();
    });

    it('should expire keys after TTL has elapsed', async () => {
      // Set key with 1-second TTL
      await RedisManager.set('test:expiring', 'ephemeral', 1);

      // Immediately available
      const immediate = await RedisManager.get('test:expiring');
      expect(immediate).toBe('ephemeral');

      // Wait 1.1s for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const expired = await RedisManager.get('test:expiring');
      expect(expired).toBeNull();
    });
  });

  describe('Token Blacklist Engine (Spec §6.1)', () => {
    it('should register and identify blacklisted tokens', async () => {
      const token = 'header.payload-revocation-test-signature';
      expect(await RedisManager.isTokenBlacklisted(token)).toBe(false);

      await RedisManager.blacklistToken(token, 60);
      expect(await RedisManager.isTokenBlacklisted(token)).toBe(true);
    });

    it('should return standby or active status for health telemetry', () => {
      const status = RedisManager.getStatus();
      expect(['active', 'standby']).toContain(status);
    });
  });
});
