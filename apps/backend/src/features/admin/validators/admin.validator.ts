import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().trim().email({ message: 'Valid administrator email address required' }),
  password: z.string().min(1, { message: 'Password is required' })
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
