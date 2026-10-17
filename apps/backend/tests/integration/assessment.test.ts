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

  it('GET /api/v1/assessments/history should return paginated assessment records', async () => {
    const token = await getAuthenticatedToken();

    // Submit 2 assessments
    await request(app)
      .post('/api/v1/assessments')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleAssessmentPayload);

    await request(app)
      .post('/api/v1/assessments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...sampleAssessmentPayload,
        symptoms: {
          ...sampleAssessmentPayload.symptoms,
          fatigueLevel: 'severe'
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
  });
});
