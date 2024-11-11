import { Logger } from '@nestjs/common';
import { IConfig } from 'src/types/config';
import { validateConfig } from 'src/validations/config.validate';

const isTrue = (
  value: string | undefined,
  defaultValue: boolean = true,
): boolean => {
  if (value === 'true' || value === '1' || value === 'yes' || value === 'on')
    return true;
  if (value === 'false' || value === '0' || value === 'no' || value === 'off')
    return false;
  if (value === undefined) return defaultValue;
  throw new Error('Invalid boolean value');
};

const logger = new Logger();

export function validate(raw: Record<string, unknown>) {
  const config: IConfig = {
    nodeEnv: (raw.NODE_ENV as string) || 'development',
    port: parseInt(raw.PORT as string) || 3000,
    corsOrigin: (raw.CORS_ORIGIN as string) || true,
    cookie: {
      domain: raw.COOKIE_DOMAIN as string,
      secret: raw.COOKIE_SECRET as string,
    },
    session: {
      name: raw.SESSION_NAME as string,
      timeout: parseInt(raw.SESSION_TIMEOUT as string),
    },
    redis: {
      url: raw.REDIS_URL as string,
    },
    status: {
      localSignup: isTrue(raw.STATUS_LOCAL_SIGNUP as string),
      localSignin: isTrue(raw.STATUS_LOCAL_SIGNIN as string),
    },
    jwt: {
      secret: raw.JWT_SECRET as string,
    },
    autoMailer: {
      host: raw.AUTO_MAILER_HOST as string,
      port: parseInt(raw.AUTO_MAILER_PORT as string),
    },
    linkUrl: {
      confirmEmail: raw.LINK_URL_CONFIRM_EMAIL as string,
    },
  };
  const result = validateConfig(config);
  if (result.success) {
    return config;
  }
  const errorPath = result.errors.map((error) => error.path).join(', ');
  logger.error(`Validation failed for ${errorPath}`);
  throw new Error('Config validation failed');
}
