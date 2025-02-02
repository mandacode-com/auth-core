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
        default: raw.JWT_SECRET as string,
        emailConfirmation: raw.EMAIL_CONFIRMATION_JWT_SECRET as string,
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
