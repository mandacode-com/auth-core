import { Config, configSchema } from 'src/schemas/config.schema';

export function validate(raw: Record<string, unknown>) {
  const env: Config = {
    NODE_ENV: raw.NODE_ENV as string,
    PORT: parseInt(raw.PORT as string),
    CORS_ORIGIN: raw.CORS_ORIGIN as string,
    COOKIE_DOMAIN: raw.COOKIE_DOMAIN as string,
    COOKIE_SECRET: raw.COOKIE_SECRET as string,
    SESSION_NAME: raw.SESSION_NAME as string,
    SESSION_TIMEOUT: parseInt(raw.SESSION_TIMEOUT as string),
    SESSION_STORAGE_URL: raw.SESSION_STORAGE_URL as string,
    STATUS_LOCAL_SIGNUP: raw.STATUS_LOCAL_SIGNUP as boolean,
    STATUS_LOCAL_SIGNIN: raw.STATUS_LOCAL_SIGNIN as boolean,
    EMAIL_CONFIRMATION_JWT_SECRET: raw.EMAIL_CONFIRMATION_JWT_SECRET as string,
    JWT_SECRET: raw.JWT_SECRET as string,
    AUTO_MAILER_HOST: raw.AUTO_MAILER_HOST as string,
    AUTO_MAILER_PORT: parseInt(raw.AUTO_MAILER_PORT as string),
    CONFIRM_EMAIL_URL: raw.CONFIRM_EMAIL_URL as string,
  };

  const parsedEnv = configSchema.parse(env);
  return parsedEnv;
}
