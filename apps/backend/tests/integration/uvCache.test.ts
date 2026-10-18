import request from 'supertest';
import { createApp } from '../../src/app';
import { connectTestDb, clearTestDb, closeTestDb } from '../setup/dbHelper';
import { RedisManager } from '../../src/core/cache/redisClient';

describe('Phase E: Redis Caching, UV Weather & Token Blacklist Integration Suite', () => {
  const app = createApp();

  beforeAll(async () => {
    await connectTestDb();
    await RedisManager.flushAll();
  }, 30000);

  afterEach(async () => {
    await clearTestDb();
    await RedisManager.flushAll();
  });

  afterAll(async () => {
    await RedisManager.disconnect();
    await closeTestDb();
  });

  describe('GET /api/v1/recommendations/solar-forecast (UV Weather Cache)', () => {
    it('should return 200 OK with UV forecast and cache the result for repeated calls', async () => {
      // First request (Cache Miss / Fetch or Fallback calculation)
      const res1 = await request(app)
        .get('/api/v1/recommendations/solar-forecast?lat=37.77&lon=-122.42');

      expect(res1.status).toBe(200);
      expect(res1.body.success).toBe(true);
      expect(res1.body.data).toBeDefined();

      const data1 = res1.body.data;
      expect(typeof data1.uvIndex).toBe('number');
      expect(['Low', 'Moderate', 'High', 'Very High', 'Extreme']).toContain(data1.category);
      expect(data1.advice).toBeDefined();
      expect(data1.cached).toBe(false);

      // Second request with same coordinates (Cache Hit)
      const res2 = await request(app)
        .get('/api/v1/recommendations/solar-forecast?lat=37.77&lon=-122.42');

      expect(res2.status).toBe(200);
      expect(res2.body.success).toBe(true);

      const data2 = res2.body.data;
      expect(data2.uvIndex).toBe(data1.uvIndex);
      expect(data2.category).toBe(data1.category);
      expect(data2.cached).toBe(true);
      expect(data2.source).toBe('cache');
    });

    it('should validate latitude boundary conditions and return 400 for out-of-bounds coordinates', async () => {
      const resInvalidLat = await request(app)
        .get('/api/v1/recommendations/solar-forecast?lat=95.0&lon=0.0');
      expect(resInvalidLat.status).toBe(400);
      expect(resInvalidLat.body.error.message).toContain('Latitude must be a valid float between -90 and 90');

      const resInvalidLon = await request(app)
        .get('/api/v1/recommendations/solar-forecast?lat=45.0&lon=200.0');
      expect(resInvalidLon.status).toBe(400);
      expect(resInvalidLon.body.error.message).toContain('Longitude must be a valid float between -180 and 180');
    });

    it('should accept default coordinates when lat/lon queries are omitted', async () => {
      const res = await request(app).get('/api/v1/recommendations/solar-forecast');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.uvIndex).toBeDefined();
    });
  });

  describe('GET /api/v1/recommendations/diet/:category (Public Diet Cache)', () => {
    it('should return dietary recommendations and cache them with 24h TTL', async () => {
      // First request (Cache miss)
      const res1 = await request(app).get('/api/v1/recommendations/diet/vegan');
      expect(res1.status).toBe(200);
      expect(res1.body.success).toBe(true);
      expect(res1.body.data.dietaryPreference).toBe('vegan');
      expect(res1.body.data.priorityFoods.length).toBeGreaterThan(0);
      expect(res1.body.data.cached).toBe(false);

      // Second request (Cache hit)
      const res2 = await request(app).get('/api/v1/recommendations/diet/vegan');
      expect(res2.status).toBe(200);
      expect(res2.body.data.cached).toBe(true);
    });

    it('should return 400 Bad Request for unrecognized diet categories', async () => {
      const res = await request(app).get('/api/v1/recommendations/diet/unknown-diet');
      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('Invalid diet category');
    });
  });

  describe('Token Revocation Blacklist Invariant (Spec §6.1 / token:blacklist:{jti})', () => {
    it('should reject requests with 401 when token is revoked in Redis', async () => {
      // 1. Register a user
      const userPayload = {
        email: 'blacklist_test@example.com',
        password: 'Password123!',
        fullName: 'Blacklist Test User',
        dateOfBirth: '1992-06-15',
        biologicalSex: 'female',
        skinType: 'type_3',
        dietaryPreference: 'omnivore'
      };

      const regRes = await request(app).post('/api/v1/auth/register').send(userPayload);
      expect(regRes.status).toBe(201);
      const token = regRes.body.data.tokens.accessToken;

      // 2. Verified request passes
      const validRes = await request(app)
        .get('/api/v1/recommendations/current')
        .set('Authorization', `Bearer ${token}`);
      expect(validRes.status).toBe(200);

      // 3. Blacklist token in Redis (Simulating logout / token revocation)
      await RedisManager.blacklistToken(token, 900);

      // 4. Subsequent request must be immediately rejected with 401
      const revokedRes = await request(app)
        .get('/api/v1/recommendations/current')
        .set('Authorization', `Bearer ${token}`);
      expect(revokedRes.status).toBe(401);
      expect(revokedRes.body.error.message).toContain('Session has been revoked');
    });
  });
});
