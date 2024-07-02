import { BadRequestException } from '@nestjs/common';
import { log } from 'console';
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

export function validate(raw: Record<string, unknown>) {
  const config: IConfig = {
    nodeEnv: (raw.NODE_ENV as string) || 'development',
    port: parseInt(raw.PORT as string) || 3000,
    corsOrigin: (raw.CORS_ORIGIN as string) || '*',
    cookie: {
      secret: raw.COOKIE_SECRET as string,
    },
    session: {
      secret: raw.SESSION_SECRET as string,
      storagePath: raw.SESSION_STORAGE_PATH as string,
      timeout: parseInt(raw.SESSION_TIMEOUT as string),
    },
    redis: {
      url: raw.REDIS_URL as string,
    },
    status: {
      localSignup: isTrue(raw.STATUS_LOCAL_SIGNUP as string | undefined),
      localSignin: isTrue(raw.STATUS_LOCAL_SIGNIN as string | undefined),
    },
  };
  const result = validateConfig(config);
  if (result.success) {
    return config;
  }
  log(result.errors);
  const errorPath = result.errors.map((error) => error.path).join(', ');
  throw new BadRequestException(`Validation failed for ${errorPath}`);
}
