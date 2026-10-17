import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, { message: 'Full name must have at least 2 characters' }).optional(),
  dateOfBirth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Valid date of birth in ISO/standard format is required'
    })
    .optional(),
  biologicalSex: z.enum(['male', 'female', 'other']).optional(),
  skinType: z.enum(['type_1', 'type_2', 'type_3', 'type_4', 'type_5', 'type_6']).optional(),
  dietaryPreference: z.enum(['omnivore', 'pescatarian', 'vegetarian', 'vegan']).optional(),
  medicalConditions: z.array(z.string()).optional()
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
