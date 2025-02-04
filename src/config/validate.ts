import { Config, configSchema } from 'src/schemas/config.schema';

const parseBoolean = (value: string) => value === 'true';

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
    status: {
      localSignup: parseBoolean(raw.STATUS_LOCAL_SIGNUP as string),
      localSignin: parseBoolean(raw.STATUS_LOCAL_SIGNIN as string),
    },
    jwt: {
      secret: {
        access: raw.JWT_SECRET_ACCESS as string,
        refresh: raw.JWT_SECRET_REFRESH as string,
        emailConfirmation: raw.JWT_SECRET_EMAIL_CONFIRMATION as string,
      },
      expiresIn: {
        access: raw.JWT_EXPIRES_IN_ACCESS as string,
        refresh: raw.JWT_EXPIRES_IN_REFRESH as string,
        emailConfirmation: raw.JWT_EXPIRES_IN_EMAIL_CONFIRMATION as string,
      },
    },
    mailer: {
      url: raw.AUTO_MAILER_URL as string,
    },
    urls: {
      confirmEmail: raw.CONFIRM_EMAIL_URL as string,
    },
  };

  const parsedEnv = configSchema.parse(env);
  return parsedEnv;
}
