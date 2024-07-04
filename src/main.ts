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
import { PrismaExceptionFilter } from './filters/prismaException.filter';
import { HttpExceptionFilter } from './filters/httpException.filter';
import helmet from 'helmet';

async function bootstrap() {
  // Create App instance
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const logger = new Logger();
  const config = app.get(ConfigService<IConfig, true>);

  // Secure setup
  app.use(helmet());

  const sessionConfig = config.get<ISessionConfig>('session');
  const cookieConfig = config.get<ICookieConfig>('cookie');
  const redisConfig = config.get<IRedisConfig>('redis');

  // Configure cookie options
  let cookieOptions: session.CookieOptions = {};
  if (config.get('nodeEnv') === 'production') {
    // Secure cookie options
    cookieOptions = {
      secure: true,
      maxAge: sessionConfig.timeout,
      sameSite: 'lax',
      priority: 'high',
    };
  } else if (
    config.get('nodeEnv') === 'development' ||
    config.get('nodeEnv') === 'test'
  ) {
    // Insecure cookie options
    cookieOptions = {
      secure: false,
      priority: 'high',
      maxAge: sessionConfig.timeout,
    };
  }

  // Create a session store
  let sessionStore: session.Store | undefined;
  if (
    config.get('nodeEnv') === 'production' ||
    config.get('nodeEnv') === 'test'
  ) {
    // Redis session store
    const redisClient = await createClient({
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
  }

  // enable cors
  if (config.get('nodeEnv') === 'production') {
    app.enableCors({
      origin: config.get('corsOrigin'),
      methods: ['GET', 'POST'],
      credentials: true,
    });
  }

  // Add session middleware
  app.use(
    session({
      name: sessionConfig.name,
      proxy: config.get('nodeEnv') === 'production',
      secret: cookieConfig.secret,
      resave: false,
      rolling: true,
      saveUninitialized: false,
      cookie: cookieOptions,
      store: sessionStore,
    }),
  );

  // Add cookie parser middleware
  app.use(cookieParser(cookieConfig.secret));

  // Implement global exception filter
  app.useGlobalFilters(new HttpExceptionFilter(), new PrismaExceptionFilter());

  await app.listen(config.get<number>('port'));
  logger.log(`Server is running on: ${await app.getUrl()}`);
}
bootstrap();
