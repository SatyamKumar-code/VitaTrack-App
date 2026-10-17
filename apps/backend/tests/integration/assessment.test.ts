import request from 'supertest';
import { createApp } from '../../src/app';
import { connectTestDb, clearTestDb, closeTestDb } from '../setup/dbHelper';

describe('Assessment Integration API Suite (TASK-P3-01 & TASK-P3-02)', () => {
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
    email: 'assessment_patient@example.com',
    password: 'SecurePassword123!',
    fullName: 'Jane Assessment',
    dateOfBirth: '1992-06-15',
    biologicalSex: 'female',
    skinType: 'type_3',
    dietaryPreference: 'omnivore',
    medicalConditions: ['celiac']
  };

  const sampleAssessmentPayload = {
    symptoms: {
      fatigueLevel: 'moderate',
      bonePainLevel: 'mild',
      muscleWeaknessLevel: 'mild',
      moodChanges: 'moderate',
      frequentInfections: true
    },
    sunExposure: {
      dailyMinutesOutdoors: 15,
      timeOfDay: 'midday',
      clothingCoverage: 'high',
      regularSunscreenSPF30: true
    },
    dietaryHabits: {
      fattyFishServingsPerWeek: 0,
      fortifiedMilkServingsPerWeek: 2,
      eggYolksPerWeek: 1,
      mushroomsWeekly: true,
      takesVitaminDSupplement: false
    }
  };

  async function getAuthenticatedToken(): Promise<string> {
    const regRes = await request(app).post('/api/v1/auth/register').send(registeredUser);
    return regRes.body.data.tokens.accessToken;
  }

  it('POST /api/v1/assessments should successfully record assessment and return 201', async () => {
    const token = await getAuthenticatedToken();

    const res = await request(app)
      .post('/api/v1/assessments')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleAssessmentPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('assessmentId');
    expect(res.body.data).toHaveProperty('timestamp');
    expect(res.body.data.results).toBeDefined();
    expect(typeof res.body.data.results.compositeScore).toBe('number');
    expect(['low', 'moderate', 'high']).toContain(res.body.data.results.riskTier);
    expect(res.body.data.results.subScores).toBeDefined();
    expect(res.body.data.results.doctorConsultationRequired).toBeDefined();
    expect(res.body.data.results.consultationUrgency).toBeDefined();
    expect(res.body.data.results.disclaimer).toContain('VitaTrack is a self-assessment screening tool');
    expect(res.body.data.aiExplanation).toBeDefined();
    expect(Array.isArray(res.body.data.aiExplanation.keyContributors)).toBe(true);
  });

  it('POST /api/v1/assessments should reject unauthenticated submissions with 401', async () => {
    const res = await request(app)
      .post('/api/v1/assessments')
      .send(sampleAssessmentPayload);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/assessments should reject malformed payload with 400 Bad Request', async () => {
    const token = await getAuthenticatedToken();

    const invalidPayload = {
      symptoms: {
        fatigueLevel: 'extreme_critical_invalid',
        bonePainLevel: 'none',
        muscleWeaknessLevel: 'none',
        moodChanges: 'none',
        frequentInfections: false
      },
      sunExposure: {
        dailyMinutesOutdoors: -50, // Invalid: negative
        timeOfDay: 'noon', // Invalid enum
        clothingCoverage: 'none', // Invalid enum
        regularSunscreenSPF30: true
      },
      dietaryHabits: {
        fattyFishServingsPerWeek: 100 // Invalid: > 21
      }
    };

    const res = await request(app)
      .post('/api/v1/assessments')
      .set('Authorization', `Bearer ${token}`)
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/assessments/latest should return 404 when user has no assessments', async () => {
    const token = await getAuthenticatedToken();

    const res = await request(app)
      .get('/api/v1/assessments/latest')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/assessments/latest should return 200 with most recent assessment', async () => {
    const token = await getAuthenticatedToken();

    // Submit initial assessment
    await request(app)
      .post('/api/v1/assessments')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleAssessmentPayload);

    const res = await request(app)
      .get('/api/v1/assessments/latest')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.symptoms.fatigueLevel).toBe('moderate');
    expect(res.body.data.sunExposure.dailyMinutesOutdoors).toBe(15);
    expect(res.body.data.dietaryHabits.fortifiedMilkServingsPerWeek).toBe(2);
    expect(res.body.data.results).toBeDefined();
  });

  it('GET /api/v1/assessments/history should return paginated assessment records with summary metrics', async () => {
    const token = await getAuthenticatedToken();

    // Submit 2 assessments
    const firstRes = await request(app)
      .post('/api/v1/assessments')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleAssessmentPayload);

    const secondRes = await request(app)
      .post('/api/v1/assessments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...sampleAssessmentPayload,
        symptoms: {
          ...sampleAssessmentPayload.symptoms,
          fatigueLevel: 'severe',
          bonePainLevel: 'severe'
        }
      });

    const res = await request(app)
      .get('/api/v1/assessments/history?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination.total).toBe(2);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).toHaveProperty('compositeScore');
    expect(res.body.data[0]).toHaveProperty('riskTier');
    expect(res.body.data[0]).toHaveProperty('doctorAlert');
    expect(res.body.data[0]).toHaveProperty('symptoms');
    expect(res.body.data[0]).toHaveProperty('sunExposure');
    expect(res.body.data[0]).toHaveProperty('dietaryHabits');

    // Summary metrics validation (TASK-P6-01)
    expect(res.body.summary).toBeDefined();
    expect(res.body.summary.totalAssessments).toBe(2);
    expect(typeof res.body.summary.averageScore).toBe('number');
    expect(typeof res.body.summary.latestScore).toBe('number');
    expect(typeof res.body.summary.earliestScore).toBe('number');
    expect(typeof res.body.summary.scoreDelta).toBe('number');
    expect(res.body.summary.riskDistribution).toBeDefined();
    expect(['improving', 'worsening', 'stable', 'insufficient_data']).toContain(
      res.body.summary.trendDirection
    );
  });

  it('GET /api/v1/assessments/history should support date range filtering', async () => {
    const token = await getAuthenticatedToken();

    await request(app)
      .post('/api/v1/assessments')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleAssessmentPayload);

    // Query with future range that matches nothing
    const emptyRes = await request(app)
      .get('/api/v1/assessments/history?startDate=2030-01-01T00:00:00Z&endDate=2030-12-31T23:59:59Z')
      .set('Authorization', `Bearer ${token}`);

    expect(emptyRes.status).toBe(200);
    expect(emptyRes.body.data.length).toBe(0);
    expect(emptyRes.body.summary.totalAssessments).toBe(0);

    // Query with broad range that matches the record
    const matchRes = await request(app)
      .get('/api/v1/assessments/history?startDate=2020-01-01T00:00:00Z')
      .set('Authorization', `Bearer ${token}`);

    expect(matchRes.status).toBe(200);
    expect(matchRes.body.data.length).toBe(1);
    expect(matchRes.body.summary.totalAssessments).toBe(1);
  });

  it('GET /api/v1/assessments/:id should retrieve specific assessment details', async () => {
    const token = await getAuthenticatedToken();

    const createRes = await request(app)
      .post('/api/v1/assessments')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleAssessmentPayload);

    const assessmentId = createRes.body.data.assessmentId;

    const res = await request(app)
      .get(`/api/v1/assessments/${assessmentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.assessmentId).toBe(assessmentId);
    expect(res.body.data.symptoms.fatigueLevel).toBe('moderate');
    expect(res.body.data.results.compositeScore).toBeDefined();
    expect(res.body.data.aiExplanation).toBeDefined();
  });

  it('GET /api/v1/assessments/:id should return 400 for malformed ID and 404 for unknown ID', async () => {
    const token = await getAuthenticatedToken();

    const badIdRes = await request(app)
      .get('/api/v1/assessments/invalid-id-format')
      .set('Authorization', `Bearer ${token}`);

    expect(badIdRes.status).toBe(400);

    const notFoundRes = await request(app)
      .get('/api/v1/assessments/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${token}`);

    expect(notFoundRes.status).toBe(404);
  });
});
