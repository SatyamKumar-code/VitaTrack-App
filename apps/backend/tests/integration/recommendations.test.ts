import request from 'supertest';
import { createApp } from '../../src/app';
import { connectTestDb, clearTestDb, closeTestDb } from '../setup/dbHelper';

describe('Recommendations & Guidance Integration API Suite (TASK-P5-01 to TASK-P5-05)', () => {
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
    email: 'guidance_patient@example.com',
    password: 'SecurePassword123!',
    fullName: 'Alex River',
    dateOfBirth: '1990-04-12',
    biologicalSex: 'male',
    skinType: 'type_4',
    dietaryPreference: 'vegetarian',
    medicalConditions: ['celiac_disease']
  };

  async function getAuthToken(): Promise<string> {
    const regRes = await request(app).post('/api/v1/auth/register').send(testUser);
    return regRes.body.data.tokens.accessToken;
  }

  it('GET /api/v1/recommendations/current should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/recommendations/current');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/recommendations/current should return personalized guidance based on user profile', async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .get('/api/v1/recommendations/current')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();

    const { nutrition, sunlight, exercise, riskTier } = res.body.data;

    // Verify nutrition matched user profile ('vegetarian')
    expect(nutrition.dietType).toBe('vegetarian');
    expect(nutrition.priorityFoods.length).toBeGreaterThan(0);
    expect(nutrition.coFactors.length).toBeGreaterThan(0);

    // Verify sunlight matched user profile ('type_4')
    expect(sunlight.skinType).toBe('type_4');
    expect(sunlight.recommendedDailyMinutes).toBe(22);
    expect(sunlight.optimalWindow).toBeDefined();

    // Verify exercise suggestions
    expect(exercise.suggestions.length).toBeGreaterThan(0);
    expect(exercise.focus).toContain('Bone Density');

    expect(riskTier).toBeDefined();
  });

  it('GET /api/v1/recommendations/current should support query overrides for diet and skinType', async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .get('/api/v1/recommendations/current?diet=vegan&skinType=type_1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.nutrition.dietType).toBe('vegan');
    expect(res.body.data.sunlight.skinType).toBe('type_1');
    expect(res.body.data.sunlight.recommendedDailyMinutes).toBe(10);
  });

  it('GET /api/v1/recommendations/education should return complete educational article catalog', async () => {
    const res = await request(app).get('/api/v1/recommendations/education');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(5);
    expect(res.body.data.length).toBe(5);
  });

  it('GET /api/v1/recommendations/education/:id should return single article with sections', async () => {
    const res = await request(app).get(
      '/api/v1/recommendations/education/art-bone-axis'
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('art-bone-axis');
    expect(res.body.data.title).toContain('Bone-Mineral Axis');
    expect(res.body.data.contentSections.length).toBeGreaterThanOrEqual(3);
  });

  it('GET /api/v1/recommendations/education/:id should return 404 for invalid article ID', async () => {
    const res = await request(app).get(
      '/api/v1/recommendations/education/non-existent-article'
    );

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
