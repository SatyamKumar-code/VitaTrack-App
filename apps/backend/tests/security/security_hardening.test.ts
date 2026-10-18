import request from 'supertest';
import { createApp } from '../../src/app';
import { Application } from 'express';
import { connectTestDb, closeTestDb } from '../setup/dbHelper';

describe('Phase 10: Security Hardening & Rate Limiting Suite (TASK-P10-01)', () => {
  let app: Application;

  beforeAll(async () => {
    await connectTestDb();
    app = createApp();
  }, 30000);

  afterAll(async () => {
    await closeTestDb();
  });

  describe('Helmet HTTP Security Headers', () => {
    it('should include strict Content-Security-Policy and defense headers', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.headers).toHaveProperty('content-security-policy');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers).not.toHaveProperty('x-powered-by');
    });

    it('should return health status ok and active service metadata', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('VitaTrack API');
    });
  });

  describe('NoSQL Query & Parameter Sanitization', () => {
    it('should sanitize dangerous MongoDB operator keys starting with $ from request body', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: { $gt: '' },
          password: 'Password123!'
        });

      // Since { $gt: '' } is stripped, email becomes undefined/empty, failing Zod schema with 400
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should sanitize keys containing dot notation to prevent prototype/nested injection', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          'user.role': 'admin',
          email: 'test@example.com',
          password: 'Password123!'
        });

      // 'user.role' is stripped by the input sanitizer
      expect(res.status).toBe(401); // Standard credential mismatch, not injection
    });
  });

  describe('Express Rate Limiting (TASK-P10-01)', () => {
    it('should allow requests within rate limit threshold', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('x-test-rate-limit', 'true')
        .send({
          email: 'ratelimit-test1@example.com',
          password: 'WrongPassword123!'
        });

      expect([400, 401]).toContain(res.status);
    });

    it('should trigger 429 Too Many Requests when auth rate limit is exceeded (> 5 attempts)', async () => {
      const makeRequest = () =>
        request(app)
          .post('/api/v1/auth/login')
          .set('x-test-rate-limit', 'true')
          .set('X-Forwarded-For', '198.51.100.42') // Unique IP for isolated test
          .send({
            email: 'bruteforce@example.com',
            password: 'BadPassword!'
          });

      // Dispatch 5 requests
      for (let i = 0; i < 5; i++) {
        await makeRequest();
      }

      // The 6th request must exceed the threshold and receive 429
      const blockedRes = await makeRequest();
      expect(blockedRes.status).toBe(429);
      expect(blockedRes.body.success).toBe(false);
      expect(blockedRes.body.error.message).toContain('Too many authentication attempts');
      expect(blockedRes.body.error.statusCode).toBe(429);
    });
  });
});
