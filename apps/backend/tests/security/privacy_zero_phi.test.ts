import request from 'supertest';
import { createApp } from '../../src/app';
import { connectTestDb, clearTestDb, closeTestDb } from '../setup/dbHelper';
import { verifyAccessToken } from '../../src/features/auth/utils/token.utils';

describe('Security & Privacy Audit: Zero-PHI Token & Credential Exposure', () => {
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

  const testUser = {
    email: 'zerophi@example.com',
    password: 'SecurePassword123!',
    fullName: 'Privacy Subject',
    dateOfBirth: '1990-01-01',
    biologicalSex: 'female',
    skinType: 'type_3',
    dietaryPreference: 'vegetarian',
    medicalConditions: ['sensitive_condition']
  };

  it('JWT access token must contain strictly { userId, role, tokenVersion } and zero PHI attributes', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(testUser);
    const token = regRes.body.data.tokens.accessToken;

    const decoded = verifyAccessToken(token) as unknown as Record<string, unknown>;

    // Inviolable Rule: No clinical or sensitive info in token payload
    expect(decoded).toHaveProperty('userId');
    expect(decoded).toHaveProperty('role');
    expect(decoded).toHaveProperty('tokenVersion');

    expect(decoded).not.toHaveProperty('email');
    expect(decoded).not.toHaveProperty('medicalConditions');
    expect(decoded).not.toHaveProperty('symptoms');
    expect(decoded).not.toHaveProperty('skinType');
    expect(decoded).not.toHaveProperty('dietaryPreference');
  });

  it('Auth and profile API responses must never leak passwordHash or salt', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(testUser);
    expect(regRes.body.data.user).not.toHaveProperty('passwordHash');
    expect(regRes.body.data.user).not.toHaveProperty('password');

    const token = regRes.body.data.tokens.accessToken;
    const profileRes = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(profileRes.body.data).not.toHaveProperty('passwordHash');
    expect(profileRes.body.data).not.toHaveProperty('password');
  });
});
