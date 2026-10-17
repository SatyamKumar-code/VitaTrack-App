import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email address format' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Za-z]/, { message: 'Password must contain at least one letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one digit' }),
  fullName: z.string().trim().min(2, { message: 'Full name must have at least 2 characters' }),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid date of birth in ISO/standard format is required'
  }),
  biologicalSex: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Biological sex must be male, female, or other' })
  }),
  skinType: z
    .enum(['type_1', 'type_2', 'type_3', 'type_4', 'type_5', 'type_6'])
    .optional()
    .default('type_3'),
  dietaryPreference: z
    .enum(['omnivore', 'pescatarian', 'vegetarian', 'vegan'])
    .optional()
    .default('omnivore'),
  medicalConditions: z.array(z.string()).optional().default([])
});

export const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' })
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, { message: 'Refresh token is required' })
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email({ message: 'Valid email is required for password recovery' })
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
