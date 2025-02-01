import { z } from 'zod';

export const signinBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const signupBodySchema = z.object({
  nickname: z
    .string()
    .regex(/^[a-zA-Z](?![-_]{2})[a-zA-Z0-9_-]*[a-zA-Z0-9]$/)
    .min(3)
    .max(16)
    .optional(),
  email: z.string().email(),
  password: z.string().min(8).max(64),
});

export type SigninBody = z.infer<typeof signinBodySchema>;
export type SignupBody = z.infer<typeof signupBodySchema>;
