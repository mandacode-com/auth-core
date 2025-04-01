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
    storage: z.object({
      host: z.string().default('localhost'),
      port: z.number().int().positive().default(6379),
      password: z.string().default(''),
    }),
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
      endpoints: z.object({
        auth: z
          .string()
          .url()
          .default('https://accounts.google.com/o/oauth2/v2/auth'),
        token: z.string().url().default('https://oauth2.googleapis.com/token'),
        profile: z
          .string()
          .url()
          .default('https://www.googleapis.com/oauth2/v1/userinfo'),
      }),
      clientId: z.string(),
      clientSecret: z.string(),
      redirectUri: z.string(),
      grantType: z.string().default('authorization_code'),
    }),
    kakao: z.object({
      endpoints: z.object({
        auth: z
          .string()
          .url()
          .default('https://kauth.kakao.com/oauth/authorize'),
        token: z.string().url().default('https://kauth.kakao.com/oauth/token'),
        profile: z.string().url().default('https://kapi.kakao.com/v2/user/me'),
      }),
      clientId: z.string(),
      clientSecret: z.string(),
      redirectUri: z.string(),
      grantType: z.string().default('authorization_code'),
    }),
    naver: z.object({
      endpoints: z.object({
        auth: z
          .string()
          .url()
          .default('https://nid.naver.com/oauth2.0/authorize'),
        token: z.string().url().default('https://nid.naver.com/oauth2.0/token'),
        profile: z
          .string()
          .url()
          .default('https://openapi.naver.com/v1/nid/me'),
      }),
      clientId: z.string(),
      clientSecret: z.string(),
      redirectUri: z.string(),
      grantType: z.string().default('authorization_code'),
    }),
  }),
});

export type Config = z.infer<typeof configSchema>;
