import request from 'supertest';
import { createApp } from '../../src/app';
import { connectTestDb, clearTestDb, closeTestDb } from '../setup/dbHelper';
import { WearableMetric } from '../../src/features/wearables/models/wearableMetric.model';
import { Assessment } from '../../src/features/assessment/models/assessment.model';

describe('Phase 8: Smartwatch & Wearable Biometric Ingestion API Suite', () => {
  const app = createApp();
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    await connectTestDb();

    // Register test patient
    const regRes = await request(app).post('/api/v1/auth/register').send({
      email: 'wearable_tester@example.com',
      password: 'SecurePassword123!',
      fullName: 'Alex River',
      dateOfBirth: '1995-04-20',
      biologicalSex: 'female',
      skinType: 'type_3',
      dietaryPreference: 'omnivore'
    });

    authToken = regRes.body.data.tokens.accessToken;
    testUserId = regRes.body.data.user.id;
  }, 30000);

  afterAll(async () => {
    await clearTestDb();
    await closeTestDb();
  });

  describe('TASK-P8-03: Wearable Ingestion Endpoint & Authentication Guard', () => {
    it('POST /api/v1/wearables/sync should reject unauthenticated requests with 401', async () => {
      const res = await request(app).post('/api/v1/wearables/sync').send({
        metricsDate: '2026-10-18',
        data: { stepCount: 5000 }
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/wearables/latest should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/wearables/latest');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/wearables/insights should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/wearables/insights');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('TASK-P8-03 / TC-WEAR-01: Ingest Valid Health Connect Biometrics & Date Deduplication', () => {
    const validPayload = {
      deviceInfo: {
        manufacturer: 'Samsung',
        model: 'Galaxy Watch 6',
        sourceApp: 'com.google.android.apps.healthdata'
      },
      metricsDate: '2026-10-18',
      data: {
        stepCount: 8420,
        restingHeartRate: 64,
        avgSpO2: 98.4,
        sleepDurationMinutes: 440, // 7h 20m
        deepSleepMinutes: 75
      }
    };

    it('TC-WEAR-01: should ingest valid Health Connect biometric payload and persist to database', async () => {
      const res = await request(app)
        .post('/api/v1/wearables/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Wearable biometrics synced');
      expect(res.body.data.syncedAt).toBeDefined();

      const metric = res.body.data.metric;
      expect(metric.metricsDate).toBe('2026-10-18');
      expect(metric.stepCount).toBe(8420);
      expect(metric.restingHeartRate).toBe(64);
      expect(metric.avgSpO2).toBe(98.4);
      expect(metric.sleepDurationMinutes).toBe(440);
      expect(metric.deepSleepMinutes).toBe(75);
      expect(metric.deviceInfo.manufacturer).toBe('Samsung');
      expect(metric.deviceInfo.model).toBe('Galaxy Watch 6');

      // Verify record exists in MongoDB collection
      const dbRecord = await WearableMetric.findOne({ userId: testUserId, metricsDate: '2026-10-18' });
      expect(dbRecord).not.toBeNull();
      expect(dbRecord?.stepCount).toBe(8420);
    });

    it('should deduplicate records by date: updating existing record rather than creating a duplicate', async () => {
      // Simulate subsequent sync later in the day with higher step count
      const updatedPayload = {
        ...validPayload,
        data: {
          ...validPayload.data,
          stepCount: 10500
        }
      };

      const res = await request(app)
        .post('/api/v1/wearables/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedPayload);

      expect(res.status).toBe(200);
      expect(res.body.data.metric.stepCount).toBe(10500);

      // Verify count of records for this date is exactly 1
      const count = await WearableMetric.countDocuments({ userId: testUserId, metricsDate: '2026-10-18' });
      expect(count).toBe(1);
    });

    it('GET /api/v1/wearables/latest should return the most recent biometric record', async () => {
      const res = await request(app)
        .get('/api/v1/wearables/latest')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).not.toBeNull();
      expect(res.body.data.metricsDate).toBe('2026-10-18');
      expect(res.body.data.stepCount).toBe(10500);
    });

    it('GET /api/v1/wearables/history should return array of recent records', async () => {
      const res = await request(app)
        .get('/api/v1/wearables/history?days=7')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('TASK-P8-03 / TC-WEAR-02: Physiological Validation & Rejection of Invalid Data', () => {
    it('TC-WEAR-02: should reject heart rate exceeding physiological limits (> 220 bpm / > 300 bpm)', async () => {
      const res = await request(app)
        .post('/api/v1/wearables/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          metricsDate: '2026-10-19',
          data: {
            stepCount: 4000,
            restingHeartRate: 310 // Physiologically invalid
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Physiological or schema validation failed');
      expect(res.body.error.details.data).toBeDefined();
    });

    it('should reject negative step counts', async () => {
      const res = await request(app)
        .post('/api/v1/wearables/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          metricsDate: '2026-10-19',
          data: {
            stepCount: -250
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject step counts exceeding 100,000 steps/day limit', async () => {
      const res = await request(app)
        .post('/api/v1/wearables/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          metricsDate: '2026-10-19',
          data: {
            stepCount: 150000
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject SpO2 percentage exceeding 100%', async () => {
      const res = await request(app)
        .post('/api/v1/wearables/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          metricsDate: '2026-10-19',
          data: {
            stepCount: 5000,
            avgSpO2: 105.0
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject sleep duration exceeding 1440 minutes (24 hours)', async () => {
      const res = await request(app)
        .post('/api/v1/wearables/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          metricsDate: '2026-10-19',
          data: {
            stepCount: 5000,
            sleepDurationMinutes: 1600
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject malformed date strings', async () => {
      const res = await request(app)
        .post('/api/v1/wearables/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          metricsDate: '18-10-2026', // Not YYYY-MM-DD
          data: {
            stepCount: 5000
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('TASK-P8-06: Wearable Correlation Insights Subsystem', () => {
    it('should synthesize correlation insights between sedentary biometrics and clinical fatigue', async () => {
      // 1. Create clinical assessment with severe fatigue for the user
      await Assessment.create({
        userId: testUserId,
        completedAt: new Date(),
        symptoms: {
          fatigueLevel: 'severe',
          bonePainLevel: 'mild',
          muscleWeaknessLevel: 'moderate',
          moodChanges: 'none',
          frequentInfections: false
        },
        sunExposure: {
          dailyMinutesOutdoors: 10,
          timeOfDay: 'midday',
          clothingCoverage: 'moderate',
          regularSunscreenSPF30: false
        },
        dietaryHabits: {
          fattyFishServingsPerWeek: 0,
          fortifiedMilkServingsPerWeek: 1,
          eggYolksPerWeek: 1,
          mushroomsWeekly: false,
          takesVitaminDSupplement: false
        },
        scoringResults: {
          compositeScore: 68,
          riskTier: 'moderate',
          subScores: {
            symptomScore: 24,
            solarDeficitScore: 15,
            dietaryDeficitScore: 17,
            medicalMultiplierScore: 0
          },
          doctorConsultationRequired: true,
          consultationUrgency: 'recommended_within_2_weeks'
        }
      });

      // 2. Ingest sedentary + low-sleep wearable data
      await request(app)
        .post('/api/v1/wearables/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          metricsDate: '2026-10-17',
          data: {
            stepCount: 2800, // Sedentary (< 4000)
            sleepDurationMinutes: 320, // Insufficient (< 360 = 5h 20m)
            restingHeartRate: 78,
            avgSpO2: 97.5
          }
        });

      // 3. Query correlation insights
      const res = await request(app)
        .get('/api/v1/wearables/insights')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const insights = res.body.data;
      expect(insights.hasWearableData).toBe(true);
      expect(insights.sevenDayAverages.avgSteps).toBeDefined();
      expect(insights.assessmentCorrelation.reportedFatigueLevel).toBe('severe');
      // Low steps + short sleep with severe fatigue => 'aggravating'
      expect(insights.assessmentCorrelation.fatigueCorrelationStatus).toBe('aggravating');
      expect(insights.assessmentCorrelation.clinicalSynergyInsight).toContain('Lifestyle Aggravation');
      expect(insights.assessmentCorrelation.clinicalSynergyInsight).toContain('circadian');
    });
  });
});
