import request from 'supertest';
import { createApp } from '../../src/app';
import { connectTestDb, clearTestDb, closeTestDb } from '../setup/dbHelper';

describe('Auth Integration API Suite (TASK-P2-01 & TASK-P2-02)', () => {
  const app = createApp();

  beforeAll(async () => {
    await connectTestDb();
  }, 30000);

  afterEach(async () => {
    await clearTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  const validRegistrationPayload = {
    email: 'patient@example.com',
    password: 'SecurePassword123!',
    fullName: 'Jane Doe',
    dateOfBirth: '1994-06-15',
    biologicalSex: 'female',
    skinType: 'type_3',
    dietaryPreference: 'vegetarian',
    medicalConditions: ['malabsorption_syndrome']
  };

  it('POST /api/v1/auth/register should register a new patient user and return tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validRegistrationPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user.email).toBe('patient@example.com');
    expect(res.body.data.user.role).toBe('patient');
    expect(res.body.data.user.skinType).toBe('type_3');
    expect(res.body.data.user).not.toHaveProperty('passwordHash');

    expect(res.body.data).toHaveProperty('tokens');
    expect(res.body.data.tokens).toHaveProperty('accessToken');
    expect(res.body.data.tokens).toHaveProperty('refreshToken');
    expect(res.body.data.tokens.expiresIn).toBe(900);
  });

  it('POST /api/v1/auth/register should reject duplicate email with 409 Conflict', async () => {
    await request(app).post('/api/v1/auth/register').send(validRegistrationPayload);

    const duplicateRes = await request(app)
      .post('/api/v1/auth/register')
      .send(validRegistrationPayload);

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
  });

  it('POST /api/v1/auth/register should reject weak password with 400 Bad Request', async () => {
    const invalidPayload = {
      ...validRegistrationPayload,
      email: 'weakpass@example.com',
      password: 'weak'
    };

    const res = await request(app).post('/api/v1/auth/register').send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toHaveProperty('details');
  });

  it('POST /api/v1/auth/login should authenticate valid user credentials', async () => {
    await request(app).post('/api/v1/auth/register').send(validRegistrationPayload);

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'patient@example.com',
      password: 'SecurePassword123!'
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('patient@example.com');
    expect(res.body.data.tokens).toHaveProperty('accessToken');
    expect(res.body.data.tokens).toHaveProperty('refreshToken');
  });

  it('POST /api/v1/auth/login should reject invalid password with 401 Unauthorized', async () => {
    await request(app).post('/api/v1/auth/register').send(validRegistrationPayload);

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'patient@example.com',
      password: 'WrongPassword999!'
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/refresh-token should rotate tokens successfully', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(validRegistrationPayload);
    const initialRefreshToken = regRes.body.data.tokens.refreshToken;

    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh-token')
      .send({ refreshToken: initialRefreshToken });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.success).toBe(true);
    expect(refreshRes.body.data.tokens).toHaveProperty('accessToken');
    expect(refreshRes.body.data.tokens).toHaveProperty('refreshToken');
    expect(refreshRes.body.data.tokens.refreshToken).not.toBe(initialRefreshToken);
  });

  it('POST /api/v1/auth/refresh-token should detect reuse and revoke sessions with 401', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(validRegistrationPayload);
    const initialRefreshToken = regRes.body.data.tokens.refreshToken;

    // First rotation succeeds
    const firstRotation = await request(app)
      .post('/api/v1/auth/refresh-token')
      .send({ refreshToken: initialRefreshToken });
    expect(firstRotation.status).toBe(200);

    // Reusing the first (now invalidated) token triggers reuse detection
    const reuseAttempt = await request(app)
      .post('/api/v1/auth/refresh-token')
      .send({ refreshToken: initialRefreshToken });

    expect(reuseAttempt.status).toBe(401);
    expect(reuseAttempt.body.error.message).toContain('Refresh token reuse detected');
  });

  it('POST /api/v1/auth/logout should revoke session tokens', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(validRegistrationPayload);
    const refreshToken = regRes.body.data.tokens.refreshToken;

    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .send({ refreshToken });

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.message).toBe('Logged out successfully.');

    // Attempting to refresh with the revoked token must fail
    const refreshAfterLogout = await request(app)
      .post('/api/v1/auth/refresh-token')
      .send({ refreshToken });

    expect(refreshAfterLogout.status).toBe(401);
  });

  it('POST /api/v1/auth/forgot-password should return success message', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'patient@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('password recovery instructions');
  });
});
