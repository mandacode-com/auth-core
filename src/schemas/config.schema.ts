import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .string()
    .nonempty()
    .transform((x) => x.toLowerCase())
    .refine((x) => ['development', 'production', 'test'].includes(x), {
      message: 'NODE_ENV must be one of "development", "production", or "test"',
    })
    .default('development'),
  PORT: z.number().int().positive().default(3000),
  CORS_ORIGIN: z
    .string()
    .regex(
      /^(?:\*|(?:https?|http):\/\/(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?::\d{2,5})?)$/,
    )
    .default('*'),
  COOKIE_DOMAIN: z.string().default('localhost'),
  COOKIE_SECRET: z
    .string()
    .min(8, 'COOKIE_SECRET must be at least 8 characters long')
    .default('cookie_secret'),
  SESSION_NAME: z.string().default('sid'),
  SESSION_TIMEOUT: z.number().int().positive().default(3600),
  SESSION_STORAGE_URL: z.string().default('redis://localhost:6379'),
  STATUS_LOCAL_SIGNUP: z
    .boolean()
    .transform((x) => x.toString().toLowerCase() === 'true')
    .default(true),
  STATUS_LOCAL_SIGNIN: z
    .boolean()
    .transform((x) => x.toString().toLowerCase() === 'true')
    .default(true),
  JWT_SECRET: z.string().min(8).default('jwt_secret'),
  AUTO_MAILER_HOST: z.string(),
  AUTO_MAILER_PORT: z.number(),
  CONFIRM_EMAIL_URL: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;
