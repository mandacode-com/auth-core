import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  IConfig,
  ICookieConfig,
  IRedisConfig,
  ISessionConfig,
} from './types/config';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const logger = new Logger();
  const config = app.get(ConfigService<IConfig, true>);

  // Session configuration
  let cookieOptions: session.CookieOptions = {};
  let sessionStore: session.Store | undefined;
  if (
    config.get('nodeEnv') === 'production' ||
    config.get('nodeEnv') === 'test'
  ) {
    // Redis session store
    const redisConfig = config.get<IRedisConfig>('redis');
    const redisClient = createClient({
      url: redisConfig.url,
    })
      .connect()
      .catch((error) => {
        logger.error('Failed to connect to Redis');
        throw error;
      });

    // Create a Redis session store
    sessionStore = new RedisStore({
      client: redisClient,
    });

    // Secure cookie options
    cookieOptions = {
      secure: true,
      sameSite: 'lax',
      priority: 'high',
    };
  } else {
    // Insecure cookie options
    cookieOptions = {
      secure: false,
      priority: 'high',
    };
  }

  // Add session middleware
  const sessionConfig = config.get<ISessionConfig>('session');
  app.use(
    session({
      name: 'SID',
      secret: sessionConfig.secret,
      resave: false,
      saveUninitialized: false,
      cookie: cookieOptions,
      store: sessionStore,
    }),
  );

  // Add cookie parser middleware
  const cookieConfig = config.get<ICookieConfig>('cookie');
  app.use(cookieParser(cookieConfig.secret));

  await app.listen(config.get<number>('port'));
  logger.log(`Server is running on: ${await app.getUrl()}`);
}
bootstrap();
