import { sanitizeLogData, logger } from '../../src/core/logger/logger';

describe('Phase 10: Server Log Sanitization & Privacy Scrub Audit (TC-PRIV-03)', () => {
  it('TC-PRIV-03: should redact passwords and authentication tokens from logged metadata', () => {
    const rawPayload = {
      email: 'patient@example.com',
      password: 'SuperSecretPassword123!',
      token: 'jwt.header.payload',
      refreshToken: '7f9a8b1c2d3e4f',
      accessToken: 'bearer-token-123'
    };

    const sanitized = sanitizeLogData(rawPayload) as Record<string, unknown>;

    expect(sanitized.email).toBe('patient@example.com');
    expect(sanitized.password).toBe('[REDACTED_SECURE_PHI]');
    expect(sanitized.token).toBe('[REDACTED_SECURE_PHI]');
    expect(sanitized.refreshToken).toBe('[REDACTED_SECURE_PHI]');
    expect(sanitized.accessToken).toBe('[REDACTED_SECURE_PHI]');
  });

  it('TC-PRIV-03: should redact symptoms and clinical scoring results from logged metadata', () => {
    const rawClinicalPayload = {
      action: 'ASSESSMENT_SUBMITTED',
      userId: 'usr_660e8400',
      symptoms: {
        fatigue: 'severe',
        bonePain: 'moderate',
        muscleWeakness: 'severe'
      },
      fatigueLevel: 3,
      bonePainLevel: 2,
      scoringResults: {
        compositeScore: 78,
        riskTier: 'High'
      }
    };

    const sanitized = sanitizeLogData(rawClinicalPayload) as Record<string, unknown>;

    expect(sanitized.action).toBe('ASSESSMENT_SUBMITTED');
    expect(sanitized.userId).toBe('usr_660e8400');
    expect(sanitized.symptoms).toBe('[REDACTED_SECURE_PHI]');
    expect(sanitized.fatigueLevel).toBe('[REDACTED_SECURE_PHI]');
    expect(sanitized.bonePainLevel).toBe('[REDACTED_SECURE_PHI]');
    expect(sanitized.scoringResults).toBe('[REDACTED_SECURE_PHI]');
  });

  it('TC-PRIV-03: should redact wearable biometric values from logged metadata', () => {
    const rawWearablePayload = {
      deviceId: 'galaxy_watch_6',
      stepCount: 8450,
      restingHeartRate: 72,
      avgSpO2: 98.4,
      sleepDurationMinutes: 420
    };

    const sanitized = sanitizeLogData(rawWearablePayload) as Record<string, unknown>;

    expect(sanitized.deviceId).toBe('galaxy_watch_6');
    expect(sanitized.stepCount).toBe('[REDACTED_SECURE_PHI]');
    expect(sanitized.restingHeartRate).toBe('[REDACTED_SECURE_PHI]');
    expect(sanitized.avgSpO2).toBe('[REDACTED_SECURE_PHI]');
    expect(sanitized.sleepDurationMinutes).toBe('[REDACTED_SECURE_PHI]');
  });

  it('TC-PRIV-03: should scrub nested arrays and deeply nested objects', () => {
    const complexNested = {
      events: [
        { type: 'sync', stepCount: 5000, status: 'ok' },
        { type: 'auth', password: 'secretPassword', status: 'ok' }
      ]
    };

    const sanitized = sanitizeLogData(complexNested) as { events: Array<Record<string, unknown>> };

    expect(sanitized.events[0].status).toBe('ok');
    expect(sanitized.events[0].stepCount).toBe('[REDACTED_SECURE_PHI]');
    expect(sanitized.events[1].status).toBe('ok');
    expect(sanitized.events[1].password).toBe('[REDACTED_SECURE_PHI]');
  });

  it('TC-PRIV-03: logger methods (info, warn, error) execute with scrubbed data without throwing', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    logger.info('Test assessment submission', { password: 'secret', symptoms: ['fatigue'] });
    logger.warn('Warning event', { refreshToken: 'token123' });
    logger.error('Error event', { restingHeartRate: 110 });

    expect(consoleSpy).toHaveBeenCalled();
    const logArg = consoleSpy.mock.calls[0][1];
    expect(logArg).toContain('[REDACTED_SECURE_PHI]');
    expect(logArg).not.toContain('secret');

    consoleSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
