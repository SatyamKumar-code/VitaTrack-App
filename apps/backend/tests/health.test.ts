import request from 'supertest';
import { createApp } from '../src/app';

describe('Health Check API Suite', () => {
  const app = createApp();

  it('GET /health should return 200 OK with proper status payload', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'VitaSun API');
    expect(res.body).toHaveProperty('version', '0.1.0');
    expect(res.body).toHaveProperty('phase', 'Phase 1 - Foundation & Tooling');
    expect(res.body).toHaveProperty('uptimeSeconds');
    expect(res.body).toHaveProperty('database');
  });

  it('GET /api/v1/health should return 200 OK on prefixed route', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'VitaSun API');
  });

  it('GET /non-existent-route should return 404 with structured JSON', async () => {
    const res = await request(app).get('/non-existent-route');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('statusCode', 404);
  });
});
