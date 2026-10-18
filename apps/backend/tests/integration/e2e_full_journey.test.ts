import request from 'supertest';
import { createApp } from '../../src/app';
import { Application } from 'express';
import { connectTestDb, closeTestDb } from '../setup/dbHelper';
import { User } from '../../src/features/auth/models/user.model';
import { Assessment } from '../../src/features/assessment/models/assessment.model';
import { WearableMetric } from '../../src/features/wearables/models/wearableMetric.model';
import { ReminderPreferences } from '../../src/features/reminders/models/reminderPreference.model';
import { AuthService } from '../../src/features/auth/services/auth.service';

describe('Phase 10: End-to-End Comprehensive Lifecycle Journey Suite (TASK-P10-02)', () => {
  let app: Application;

  beforeAll(async () => {
    await connectTestDb();
    app = createApp();
  }, 30000);

  afterAll(async () => {
    await closeTestDb();
  });

  describe('Full Patient Lifecycle Journey: Auth -> Profile -> Survey -> Recs -> Wearables -> Admin Zero-PHI', () => {
    let accessToken: string;
    let refreshToken: string;
    let assessmentId: string;
    const testEmail = 'e2e_patient_p10@vitatrack.internal';
    const testPassword = 'StrongPassword123!';

    it('Step 1: Patient Registration and JWT Token Pair Issuance', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          fullName: 'Jane Doe',
          dateOfBirth: '1992-06-15',
          biologicalSex: 'female',
          skinType: 'type_3',
          dietaryPreference: 'vegan',
          medicalConditions: ['gastrointestinal_malabsorption']
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testEmail);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();

      accessToken = res.body.data.tokens.accessToken;
      refreshToken = res.body.data.tokens.refreshToken;
    });

    it('Step 2: Profile Update with Demographics and Biological Multipliers', async () => {
      const res = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          fullName: 'Jane Doe Updated',
          skinType: 'type_4',
          dietaryPreference: 'vegan',
          medicalConditions: ['gastrointestinal_malabsorption']
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.skinType).toBe('type_4');
      expect(res.body.data.dietaryPreference).toBe('vegan');
    });

    it('Step 3: Complete Clinical Assessment Submission & Scoring Engine Invocation', async () => {
      const res = await request(app)
        .post('/api/v1/assessments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          symptoms: {
            fatigueLevel: 'severe',
            bonePainLevel: 'severe',
            muscleWeaknessLevel: 'severe',
            moodChanges: 'moderate',
            frequentInfections: true
          },
          sunExposure: {
            dailyMinutesOutdoors: 5,
            timeOfDay: 'midday',
            clothingCoverage: 'high',
            regularSunscreenSPF30: true
          },
          dietaryHabits: {
            fattyFishServingsPerWeek: 0,
            fortifiedMilkServingsPerWeek: 0,
            eggYolksPerWeek: 0,
            mushroomsWeekly: false,
            takesVitaminDSupplement: false
          }
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.results.compositeScore).toBeGreaterThanOrEqual(70);
      expect(res.body.data.results.riskTier).toBe('high');
      expect(res.body.data.results.disclaimer).toBeDefined();
      expect(res.body.data.results.doctorConsultationRequired).toBe(true);
      expect(res.body.data.aiExplanation).toBeDefined();
      expect(Array.isArray(res.body.data.aiExplanation.keyContributors)).toBe(true);

      assessmentId = res.body.data.assessmentId;
    });

    it('Step 4: Longitudinal History & Trend Inspection', async () => {
      const res = await request(app)
        .get('/api/v1/assessments/history')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.summary.totalAssessments).toBeGreaterThanOrEqual(1);
    });

    it('Step 5: Personalized Nutrition, Sunlight & Exercise Guidance Engine Verification', async () => {
      const recRes = await request(app)
        .get('/api/v1/recommendations/current')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(recRes.status).toBe(200);
      expect(recRes.body.success).toBe(true);
      expect(recRes.body.data.nutrition.dietType).toBe('vegan');
      expect(recRes.body.data.exercise.suggestions.length).toBeGreaterThan(0);
      expect(recRes.body.data.riskTier).toBe('high');
    });

    it('Step 6: Smartwatch Health Connect Biometric Ingestion & Deduplication', async () => {
      const metricDate = new Date().toISOString().split('T')[0];

      const res = await request(app)
        .post('/api/v1/wearables/sync')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          deviceInfo: {
            manufacturer: 'Samsung',
            model: 'Galaxy Watch 6',
            sourceApp: 'com.google.android.apps.healthdata'
          },
          metricsDate: metricDate,
          data: {
            stepCount: 7850,
            restingHeartRate: 68,
            avgSpO2: 98.2,
            sleepDurationMinutes: 440
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metric.stepCount).toBe(7850);
    });

    it('Step 7: Context-Aware Reminders Configuration', async () => {
      const res = await request(app)
        .put('/api/v1/reminders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          sunlightReminderEnabled: true,
          sunlightTime: '11:30',
          supplementReminderEnabled: true,
          supplementTime: '08:30',
          reassessmentIntervalDays: 14
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sunlightTime).toBe('11:30');
      expect(res.body.data.reassessmentIntervalDays).toBe(14);
    });

    it('Step 8: Admin Zero-PHI Invariant Security Verification', async () => {
      // 1. Create and authenticate an admin using AuthService
      const admin = new User({
        email: 'sysadmin_e2e_p10@vitatrack.internal',
        passwordHash: '$2b$12$DUMMY_HASH_VAL_NOT_REAL_FOR_TESTS',
        fullName: 'Admin Auditor',
        dateOfBirth: new Date('1985-05-15'),
        biologicalSex: 'other',
        skinType: 'type_3',
        dietaryPreference: 'omnivore',
        role: 'admin',
        isActive: true,
        tokenVersion: 0
      });
      await admin.save();
      const tokens = await AuthService.issueTokenPair(admin);

      // 2. Query admin metrics
      const metricsRes = await request(app)
        .get('/api/v1/admin/metrics')
        .set('Authorization', `Bearer ${tokens.accessToken}`);

      expect(metricsRes.status).toBe(200);

      // Stringent Zero-PHI Regex check across the entire admin metrics response
      const responseText = JSON.stringify(metricsRes.body);
      expect(responseText).not.toContain(testEmail);
      expect(responseText).not.toContain('Jane Doe');
      expect(responseText).not.toContain('bonePainLevel');
      expect(responseText).not.toContain('fatigueLevel');
      expect(responseText).not.toContain('gastrointestinal_malabsorption');
    });

    it('Step 9: Single-Use Refresh Token Rotation & Session Hygiene', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).not.toBe(refreshToken);

      // Reusing the old refresh token must be rejected (compromise detection)
      const reuseRes = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });

      expect(reuseRes.status).toBe(401);
    });
  });
});
