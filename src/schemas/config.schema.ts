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
  jwt: z.object({
    access: z.object({
      public: z.string(),
      private: z.string(),
      expiresIn: z
        .string()
        .regex(/^\d+[smhdy]$/)
        .default('15m'),
    }),
    refresh: z.object({
      public: z.string(),
      private: z.string(),
      expiresIn: z
        .string()
        .regex(/^\d+[smhdy]$/)
        .default('30d'),
    }),
    emailVerification: z.object({
      public: z.string(),
      private: z.string(),
      expiresIn: z
        .string()
        .regex(/^\d+[smhdy]$/)
        .default('30d'),
    }),
  }),
  mailer: z.object({
    url: z.string(),
    minDelay: z
      .string()
      .regex(/^\d+[smhdy]$/)
      .default('1m'),
  }),
  urls: z.object({
    verifyEmail: z.string().url(),
  }),
  servicesStatus: z.object({
    auth: z.object({
      local: z.object({
        signup: z.boolean().default(true),
        login: z.boolean().default(true),
        verifyEmail: z.boolean().default(true),
        resend: z.boolean().default(true),
      }),
    }),
    session: z.object({
      check: z.boolean().default(true),
      destroy: z.boolean().default(true),
    }),
    token: z.object({
      refresh: z.boolean().default(true),
    }),
  }),
  oauth: z.object({
    google: z.object({
      clientId: z.string(),
      clientSecret: z.string(),
    }),
  }),
});

export type Config = z.infer<typeof configSchema>;
