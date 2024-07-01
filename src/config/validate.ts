import { BadRequestException } from '@nestjs/common';
import { log } from 'console';
import { IConfig } from 'src/types/config';
import { validateConfig } from 'src/validations/config.validate';

export function validate(raw: Record<string, unknown>) {
  const config: IConfig = {
    nodeEnv: raw.NODE_ENV as string,
    port: parseInt(raw.PORT as string),
    corsOrigin: raw.CORS_ORIGIN as string,
    cookie: {
      secret: raw.COOKIE_SECRET as string,
    },
    session: {
      secret: raw.SESSION_SECRET as string,
      storagePath: raw.SESSION_STORAGE_PATH as string,
    },
    redis: {
      url: raw.REDIS_URL as string,
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
