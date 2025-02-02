import { z } from 'zod';

export const configSchema = z.object({
  server: z.object({
    nodeEnv: z
      .string()
      .nonempty()
      .transform((x) => x.toLowerCase())
      .refine((x) => ['development', 'production', 'test'].includes(x), {
        message:
          'NODE_ENV must be one of "development", "production", or "test"',
      })
      .default('development'),
    port: z.number().int().positive().default(3000),
  }),
  cors: z.object({
    origin: z.string().default('*'),
  }),
  cookie: z.object({
    domain: z.string().default('localhost'),
    secret: z
      .string()
      .min(8, 'COOKIE_SECRET must be at least 8 characters long')
      .default('cookie_secret'),
  }),
  session: z.object({
    name: z.string().default('sid'),
    timeout: z.number().int().positive().default(3600),
    storageUrl: z.string().default('redis://localhost:6379'),
  }),
  status: z.object({
    localSignup: z.boolean().default(true),
    localSignin: z.boolean().default(true),
  }),
  jwt: z.object({
    secret: z.object({
      emailConfirmation: z.string().min(8),
      default: z.string().min(8),
    }),
  }),
  mailer: z.object({
    url: z.string(),
  }),
  urls: z.object({
    confirmEmail: z.string().url(),
  }),
});

export type Config = z.infer<typeof configSchema>;
