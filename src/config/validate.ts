import { Config, configSchema } from 'src/schemas/config.schema';

export function validate(raw: Record<string, unknown>) {
  const env: Config = {
    server: {
      nodeEnv: raw.NODE_ENV as string,
      port: parseInt(raw.PORT as string),
    },
    cors: {
      origin: raw.CORS_ORIGIN as string,
    },
    cookie: {
      domain: raw.COOKIE_DOMAIN as string,
      secret: raw.COOKIE_SECRET as string,
    },
    session: {
      name: raw.SESSION_NAME as string,
      timeout: parseInt(raw.SESSION_TIMEOUT as string),
      storageUrl: raw.SESSION_STORAGE_URL as string,
    },
    jwt: {
      public: {
        access: raw.JWT_PUBLIC_ACCESS as string,
        refresh: raw.JWT_PUBLIC_REFRESH as string,
        emailVerification: raw.JWT_PUBLIC_EMAIL_VERIFICATION as string,
      },
      private: {
        access: raw.JWT_PRIVATE_ACCESS as string,
        refresh: raw.JWT_PRIVATE_REFRESH as string,
        emailVerification: raw.JWT_PRIVATE_EMAIL_VERIFICATION as string,
      },
      expiresIn: {
        access: raw.JWT_EXPIRES_IN_ACCESS as string,
        refresh: raw.JWT_EXPIRES_IN_REFRESH as string,
        emailVerification: raw.JWT_EXPIRES_IN_EMAIL_VERIFICATION as string,
      },
    },
    mailer: {
      url: raw.AUTO_MAILER_URL as string,
    },
    urls: {
      verifyEmail: raw.VERIFY_EMAIL_URL as string,
    },
  };

  const parsedEnv = configSchema.parse(env);
  return parsedEnv;
}
