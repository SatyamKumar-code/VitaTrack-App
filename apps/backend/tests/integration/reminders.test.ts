import request from 'supertest';
import { createApp } from '../../src/app';
import { connectTestDb, clearTestDb, closeTestDb } from '../setup/dbHelper';

describe('Phase 7: Context-Aware Reminders & Notification System Integration API Suite', () => {
  const app = createApp();
  let authToken: string;

  beforeAll(async () => {
    await connectTestDb();
    const regRes = await request(app).post('/api/v1/auth/register').send({
      email: 'reminders_patient@example.com',
      password: 'SecurePassword123!',
      fullName: 'Jordan Lee',
      dateOfBirth: '1992-06-15',
      biologicalSex: 'female',
      skinType: 'type_3',
      dietaryPreference: 'omnivore'
    });
    authToken = regRes.body.data.tokens.accessToken;
  }, 30000);

  afterAll(async () => {
    await clearTestDb();
    await closeTestDb();
  });

  describe('TASK-P7-01: Notification Configuration & Endpoint Authentication', () => {
    it('GET /api/v1/reminders should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/reminders');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('PUT /api/v1/reminders should reject unauthenticated requests with 401', async () => {
      const res = await request(app).put('/api/v1/reminders').send({ sunlightReminderEnabled: true });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/reminders should return initialized default preferences for new user', async () => {
      const res = await request(app)
        .get('/api/v1/reminders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.sunlightReminderEnabled).toBe(true);
      expect(res.body.data.sunlightTime).toBe('10:30');
      expect(res.body.data.dietaryReminderEnabled).toBe(true);
      expect(res.body.data.dietaryTime).toBe('12:30');
      expect(res.body.data.supplementReminderEnabled).toBe(true);
      expect(res.body.data.supplementTime).toBe('09:00');
      expect(res.body.data.reassessmentReminderEnabled).toBe(true);
      expect(res.body.data.reassessmentIntervalDays).toBe(14);
    });
  });

  describe('TASK-P7-02: Daily Sunlight Local Notification Preferences', () => {
    it('PUT /api/v1/reminders should successfully update sunlight reminder settings', async () => {
      const res = await request(app)
        .put('/api/v1/reminders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sunlightReminderEnabled: true,
          sunlightTime: '08:45'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sunlightTime).toBe('08:45');
      expect(res.body.data.sunlightReminderEnabled).toBe(true);
    });

    it('PUT /api/v1/reminders should reject invalid 24h sunlight time formats', async () => {
      const res = await request(app)
        .put('/api/v1/reminders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sunlightTime: '25:99' // Invalid hour and minute
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.details.sunlightTime).toBeDefined();
    });
  });

  describe('TASK-P7-03: Dietary Habit & Supplement Reminders', () => {
    it('PUT /api/v1/reminders should update meal and supplement schedule times', async () => {
      const res = await request(app)
        .put('/api/v1/reminders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dietaryReminderEnabled: true,
          dietaryTime: '13:15',
          supplementReminderEnabled: true,
          supplementTime: '08:30'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.dietaryTime).toBe('13:15');
      expect(res.body.data.supplementTime).toBe('08:30');
    });

    it('PUT /api/v1/reminders should allow disabling supplement reminders', async () => {
      const res = await request(app)
        .put('/api/v1/reminders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          supplementReminderEnabled: false
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.supplementReminderEnabled).toBe(false);
    });
  });

  describe('TASK-P7-04: Periodic Re-Assessment Scheduler', () => {
    it('PUT /api/v1/reminders should update reassessment interval days', async () => {
      const res = await request(app)
        .put('/api/v1/reminders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reassessmentReminderEnabled: true,
          reassessmentIntervalDays: 30
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reassessmentIntervalDays).toBe(30);
      expect(res.body.data.reassessmentReminderEnabled).toBe(true);
    });

    it('PUT /api/v1/reminders should reject reassessment interval out of [1, 90] bounds', async () => {
      const res = await request(app)
        .put('/api/v1/reminders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reassessmentIntervalDays: 120
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.details.reassessmentIntervalDays).toBeDefined();
    });

    it('POST /api/v1/reminders/test should generate context-aware test notification payload', async () => {
      const res = await request(app)
        .post('/api/v1/reminders/test')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'sunlight',
          durationMinutes: 20
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toContain('☀️');
      expect(res.body.data.body).toContain('20-minute');
      expect(res.body.data.data.type).toBe('sunlight');
    });
  });
});
