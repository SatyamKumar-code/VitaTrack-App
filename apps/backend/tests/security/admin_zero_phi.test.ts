import request from 'supertest';
import { createApp } from '../../src/app';
import { connectTestDb, clearTestDb, closeTestDb } from '../setup/dbHelper';
import { User } from '../../src/features/auth/models/user.model';
import { Assessment } from '../../src/features/assessment/models/assessment.model';
import { WearableMetric } from '../../src/features/wearables/models/wearableMetric.model';
import { AuthService } from '../../src/features/auth/services/auth.service';

describe('Phase 9 Security & Privacy: Admin Telemetry & Zero-PHI Invariant', () => {
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

  async function createAdminUser() {
    const admin = new User({
      email: 'sysadmin@vitatrack.com',
      passwordHash: 'SuperSecretAdmin123!',
      fullName: 'System Administrator',
      dateOfBirth: new Date('1985-05-15'),
      biologicalSex: 'other',
      role: 'admin',
      isActive: true,
      tokenVersion: 0
    });
    await admin.save();
    const tokens = await AuthService.issueTokenPair(admin);
    return { admin, tokens };
  }

  async function createPatientUser() {
    const patient = new User({
      email: 'patient@example.com',
      passwordHash: 'PatientSecret123!',
      fullName: 'Jane Doe',
      dateOfBirth: new Date('1995-08-20'),
      biologicalSex: 'female',
      skinType: 'type_3',
      dietaryPreference: 'omnivore',
      medicalConditions: ['osteopenia'],
      role: 'patient',
      isActive: true,
      tokenVersion: 0
    });
    await patient.save();
    const tokens = await AuthService.issueTokenPair(patient);
    return { patient, tokens };
  }

  // Mandatory Test Plan Case: TC-PRIV-01
  it('TC-PRIV-01: Admin requests /api/v1/admin/metrics returns macro counts only and ZERO patient records or PHI', async () => {
    const { tokens } = await createAdminUser();
    const { patient } = await createPatientUser();

    // Populate a test assessment with clinical PHI
    await Assessment.create({
      userId: patient._id,
      completedAt: new Date(),
      symptoms: {
        fatigueLevel: 'severe',
        bonePainLevel: 'moderate',
        muscleWeaknessLevel: 'mild',
        moodChanges: 'none',
        frequentInfections: true
      },
      sunExposure: {
        dailyMinutesOutdoors: 15,
        timeOfDay: 'midday',
        clothingCoverage: 'moderate',
        sunscreenUse: 'always',
        geographicRegion: 'temperate'
      },
      dietaryHabits: {
        fattyFishWeeklyServings: 0,
        fortifiedDairyWeeklyServings: 1,
        eggYolksWeeklyCount: 2,
        supplementsDaily: false
      },
      scoringResults: {
        compositeScore: 68,
        riskTier: 'moderate',
        confidenceLevel: 'high',
        primaryContributors: ['fatigue', 'bonePain']
      }
    });

    const res = await request(app)
      .get('/api/v1/admin/metrics')
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('macroAnalytics');
    expect(res.body.data).toHaveProperty('apiTelemetry');
    expect(res.body.data).toHaveProperty('recentErrorStream');

    const rawBody = JSON.stringify(res.body);

    // Architectural Invariant: Assert complete absence of sensitive clinical keywords and patient details
    expect(rawBody).not.toMatch(/Jane Doe/i);
    expect(rawBody).not.toMatch(/patient@example\.com/i);
    expect(rawBody).not.toMatch(/fatigue/i);
    expect(rawBody).not.toMatch(/bonePain/i);
    expect(rawBody).not.toMatch(/osteopenia/i);
    expect(rawBody).not.toMatch(/symptomScore/i);
    expect(rawBody).not.toMatch(/spO2/i);
    expect(rawBody).not.toMatch(/patientName/i);
  });

  // Mandatory Test Plan Case: TC-PRIV-02
  it('TC-PRIV-02: Non-admin user attempts access to admin endpoint returns 403 Forbidden', async () => {
    const { tokens: patientTokens } = await createPatientUser();

    const metricsRes = await request(app)
      .get('/api/v1/admin/metrics')
      .set('Authorization', `Bearer ${patientTokens.accessToken}`);

    expect(metricsRes.status).toBe(403);
    expect(metricsRes.body.error.message).toMatch(/Administrative role required/i);

    const healthRes = await request(app)
      .get('/api/v1/admin/health')
      .set('Authorization', `Bearer ${patientTokens.accessToken}`);

    expect(healthRes.status).toBe(403);

    const auditRes = await request(app)
      .get('/api/v1/admin/audit-logs')
      .set('Authorization', `Bearer ${patientTokens.accessToken}`);

    expect(auditRes.status).toBe(403);
  });

  it('Unauthenticated requests to admin endpoints return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/v1/admin/metrics');
    expect(res.status).toBe(401);
  });

  // TASK-P9-01: Admin Telemetry Ingestion API (Health check)
  it('TASK-P9-01: GET /api/v1/admin/health returns system resource visualizers and connection pool details', async () => {
    const { tokens } = await createAdminUser();

    const res = await request(app)
      .get('/api/v1/admin/health')
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.services).toHaveProperty('api', 'online');
    expect(res.body.data.services).toHaveProperty('database');
    expect(res.body.data.system).toHaveProperty('uptimeSeconds');
    expect(res.body.data.system).toHaveProperty('processMemory');
    expect(res.body.data.system.processMemory).toHaveProperty('heapUsedMB');
    expect(res.body.data.system.processMemory).toHaveProperty('rssMB');
    expect(res.body.data.database).toHaveProperty('poolSize');
  });

  // TASK-P9-02: Admin Role Authentication & RBAC
  it('TASK-P9-02: POST /api/v1/admin/auth/login authenticates admin and generates valid JWT session', async () => {
    await createAdminUser();

    const res = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({
        email: 'sysadmin@vitatrack.com',
        password: 'SuperSecretAdmin123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('admin');
    expect(res.body.data.tokens).toHaveProperty('accessToken');
    expect(res.body.data.tokens).toHaveProperty('refreshToken');
  });

  it('TASK-P9-02: POST /api/v1/admin/auth/login rejects non-admin users with 403 Forbidden', async () => {
    await createPatientUser();

    const res = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({
        email: 'patient@example.com',
        password: 'PatientSecret123!'
      });

    expect(res.status).toBe(403);
    expect(res.body.error.message).toMatch(/Administrative role privileges required/i);
  });

  // TASK-P9-04: Aggregate Macro App Analytics & N >= 10 Rule
  it('TASK-P9-04: Macro analytics suppresses risk distribution when assessments N < 10 (Differential Privacy)', async () => {
    const { tokens } = await createAdminUser();
    const { patient } = await createPatientUser();

    // Insert only 3 assessments (N < 10)
    for (let i = 0; i < 3; i++) {
      await Assessment.create({
        userId: patient._id,
        completedAt: new Date(),
        symptoms: {
          fatigueLevel: 'mild',
          bonePainLevel: 'none',
          muscleWeaknessLevel: 'none',
          moodChanges: 'none',
          frequentInfections: false
        },
        sunExposure: {
          dailyMinutesOutdoors: 30,
          timeOfDay: 'midday',
          clothingCoverage: 'low',
          sunscreenUse: 'rarely',
          geographicRegion: 'tropical'
        },
        dietaryHabits: {
          fattyFishWeeklyServings: 2,
          fortifiedDairyWeeklyServings: 5,
          eggYolksWeeklyCount: 4,
          supplementsDaily: true
        },
        scoringResults: {
          compositeScore: 15,
          riskTier: 'low',
          confidenceLevel: 'high',
          primaryContributors: []
        }
      });
    }

    const res = await request(app)
      .get('/api/v1/admin/metrics')
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res.status).toBe(200);
    const dist = res.body.data.macroAnalytics.distribution;
    expect(dist.sampleSize).toBe(3);
    expect(dist.lowRiskPercentage).toBeNull();
    expect(dist.moderateRiskPercentage).toBeNull();
    expect(dist.highRiskPercentage).toBeNull();
    expect(dist.privacyNotice).toContain('N < 10');
  });

  it('TASK-P9-04: Macro analytics computes risk distribution when assessments N >= 10', async () => {
    const { tokens } = await createAdminUser();
    const { patient } = await createPatientUser();

    // Insert 10 assessments
    for (let i = 0; i < 10; i++) {
      await Assessment.create({
        userId: patient._id,
        completedAt: new Date(),
        symptoms: {
          fatigueLevel: 'none',
          bonePainLevel: 'none',
          muscleWeaknessLevel: 'none',
          moodChanges: 'none',
          frequentInfections: false
        },
        sunExposure: {
          dailyMinutesOutdoors: 40,
          timeOfDay: 'midday',
          clothingCoverage: 'low',
          sunscreenUse: 'rarely',
          geographicRegion: 'tropical'
        },
        dietaryHabits: {
          fattyFishWeeklyServings: 3,
          fortifiedDairyWeeklyServings: 7,
          eggYolksWeeklyCount: 5,
          supplementsDaily: true
        },
        scoringResults: {
          compositeScore: 10,
          riskTier: i < 6 ? 'low' : i < 9 ? 'moderate' : 'high',
          confidenceLevel: 'high',
          primaryContributors: []
        }
      });
    }

    const res = await request(app)
      .get('/api/v1/admin/metrics')
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res.status).toBe(200);
    const dist = res.body.data.macroAnalytics.distribution;
    expect(dist.sampleSize).toBe(10);
    expect(dist.lowRiskPercentage).toBe(60);
    expect(dist.moderateRiskPercentage).toBe(30);
    expect(dist.highRiskPercentage).toBe(10);
  });

  it('Audit logging records events and GET /api/v1/admin/audit-logs retrieves ledger', async () => {
    const { tokens } = await createAdminUser();

    // Trigger an admin login which creates an audit record
    await request(app)
      .post('/api/v1/admin/auth/login')
      .send({
        email: 'sysadmin@vitatrack.com',
        password: 'SuperSecretAdmin123!'
      });

    const res = await request(app)
      .get('/api/v1/admin/audit-logs')
      .set('Authorization', `Bearer ${tokens.accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('adminEmail');
    expect(res.body.data[0]).toHaveProperty('action');
    expect(res.body.data[0]).toHaveProperty('timestamp');
  });
});
