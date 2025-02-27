import { z } from 'zod';

export const nicknameSchema = z
  .string()
  .regex(
    /^[a-zA-Z0-9](?!.*[-_]{2})[a-zA-Z0-9-_]{1,14}[a-zA-Z0-9]$/,
    'Nickname must start and end with an alphanumeric character and must not contain consecutive special characters',
  )
  .min(3, 'Nickname must be at least 3 characters long')
  .max(16, 'Nickname must be at most 16 characters long');
export const loginIdSchema = z
  .string()
  .regex(
    /^(?!.*[-_]{2})[a-zA-Z0-9!@#$%^&*]+$/,
    'Login ID must not contain consecutive special characters',
  )
  .min(8, 'Login ID must be at least 8 characters long')
  .max(256, 'Login ID must be at most 256 characters long');
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(256, 'Password must be at most 256 characters long')
  .regex(
    /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).+$/,
    'Password must contain at least one lowercase letter, one number, and one special character',
  );

export const loginBodySchema = z.object({
  loginId: loginIdSchema,
  password: passwordSchema,
});

export const signupBodySchema = z.object({
  nickname: nicknameSchema.optional(),
  loginId: loginIdSchema,
  email: z.string().email(),
  password: passwordSchema,
});

export type LoginBody = z.infer<typeof loginBodySchema>;
export type SignupBody = z.infer<typeof signupBodySchema>;
