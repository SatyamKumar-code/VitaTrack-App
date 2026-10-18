import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const biometricDataSchema = z.object({
  stepCount: z
    .number({ required_error: 'stepCount is required' })
    .int('stepCount must be an integer')
    .min(0, 'stepCount cannot be negative')
    .max(100000, 'stepCount exceeds physiological limit (100,000 steps/day)'),
  restingHeartRate: z
    .number()
    .min(30, 'Resting heart rate must be at least 30 bpm')
    .max(220, 'Resting heart rate cannot exceed 220 bpm')
    .optional(),
  avgSpO2: z
    .number()
    .min(50.0, 'SpO2 percentage must be at least 50%')
    .max(100.0, 'SpO2 percentage cannot exceed 100%')
    .optional(),
  sleepDurationMinutes: z
    .number()
    .min(0, 'Sleep duration cannot be negative')
    .max(1440, 'Sleep duration cannot exceed 1440 minutes (24 hours)')
    .optional(),
  deepSleepMinutes: z
    .number()
    .min(0, 'Deep sleep cannot be negative')
    .max(720, 'Deep sleep cannot exceed 720 minutes (12 hours)')
    .optional()
});

export const wearableSyncSchema = z.object({
  metricsDate: z
    .string({ required_error: 'metricsDate is required' })
    .regex(dateRegex, { message: 'metricsDate must be in YYYY-MM-DD format' }),
  deviceInfo: z
    .object({
      manufacturer: z.string().trim().max(100).optional(),
      model: z.string().trim().max(100).optional(),
      sourceApp: z.string().trim().max(100).optional()
    })
    .optional(),
  data: biometricDataSchema
});

export type BiometricDataDto = z.infer<typeof biometricDataSchema>;
export type WearableSyncDto = z.infer<typeof wearableSyncSchema>;
