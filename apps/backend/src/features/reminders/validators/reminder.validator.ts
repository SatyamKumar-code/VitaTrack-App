import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const updateReminderPreferencesSchema = z.object({
  sunlightReminderEnabled: z.boolean().optional(),
  sunlightTime: z
    .string()
    .regex(timeRegex, { message: 'sunlightTime must be in 24-hour HH:mm format (e.g. 10:30)' })
    .optional(),
  dietaryReminderEnabled: z.boolean().optional(),
  dietaryTime: z
    .string()
    .regex(timeRegex, { message: 'dietaryTime must be in 24-hour HH:mm format (e.g. 12:30)' })
    .optional(),
  supplementReminderEnabled: z.boolean().optional(),
  supplementTime: z
    .string()
    .regex(timeRegex, { message: 'supplementTime must be in 24-hour HH:mm format (e.g. 09:00)' })
    .optional(),
  reassessmentReminderEnabled: z.boolean().optional(),
  reassessmentIntervalDays: z
    .number()
    .int()
    .min(1, { message: 'reassessmentIntervalDays must be at least 1 day' })
    .max(90, { message: 'reassessmentIntervalDays cannot exceed 90 days' })
    .optional(),
  pushToken: z.string().trim().max(256).optional()
});

export type UpdateReminderPreferencesDto = z.infer<typeof updateReminderPreferencesSchema>;
