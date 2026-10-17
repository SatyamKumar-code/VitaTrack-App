import request from 'supertest';
import { createApp } from '../../src/app';
import { connectTestDb, clearTestDb, closeTestDb } from '../setup/dbHelper';

describe('Profile Integration API Suite (TASK-P2-05)', () => {
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

  const registeredUser = {
    email: 'profiletest@example.com',
    password: 'SecurePassword123!',
    fullName: 'Jane Profile',
    dateOfBirth: '1995-04-12',
    biologicalSex: 'female',
    skinType: 'type_2',
    dietaryPreference: 'omnivore',
    medicalConditions: []
  };

  async function getAuthenticatedToken(): Promise<string> {
    const regRes = await request(app).post('/api/v1/auth/register').send(registeredUser);
    return regRes.body.data.tokens.accessToken;
  }

  it('GET /api/v1/users/profile should return 200 with patient profile attributes', async () => {
    const token = await getAuthenticatedToken();

    const res = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.email).toBe('profiletest@example.com');
    expect(res.body.data.fullName).toBe('Jane Profile');
    expect(res.body.data.biologicalSex).toBe('female');
    expect(res.body.data.skinType).toBe('type_2');
    expect(res.body.data.dietaryPreference).toBe('omnivore');
    expect(res.body.data.role).toBe('patient');
  });

  it('GET /api/v1/users/profile should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/users/profile');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('PUT /api/v1/users/profile should update demographic & dietary parameters', async () => {
    const token = await getAuthenticatedToken();

    const updates = {
      dietaryPreference: 'vegan',
      skinType: 'type_4',
      medicalConditions: ['celiac_disease', 'lactose_intolerance'],
      fullName: 'Jane Updated'
    };

    const res = await request(app)
      .put('/api/v1/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(updates);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.dietaryPreference).toBe('vegan');
    expect(res.body.data.skinType).toBe('type_4');
    expect(res.body.data.fullName).toBe('Jane Updated');
    expect(res.body.data.medicalConditions).toEqual(
      expect.arrayContaining(['celiac_disease', 'lactose_intolerance'])
    );
  });

  it('PUT /api/v1/users/profile should reject invalid enum values with 400 Bad Request', async () => {
    const token = await getAuthenticatedToken();

    const invalidUpdates = {
      dietaryPreference: 'carnivore_non_existent',
      skinType: 'invalid_type'
    };

    const res = await request(app)
      .put('/api/v1/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(invalidUpdates);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
