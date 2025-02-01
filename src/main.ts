import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { PrismaExceptionFilter } from './filters/prismaException.filter';
import { HttpExceptionFilter } from './filters/httpException.filter';
import helmet from 'helmet';
import { Config } from './schemas/config.schema';

async function bootstrap() {
  // Create App instance
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const logger = new Logger();
  const config = app.get(ConfigService<Config, true>);

  // Secure setup
  app.use(helmet());

  // Configure cookie options
  let cookieOptions: session.CookieOptions = {};
  if (config.get('NODE_ENV') === 'production') {
    // Secure cookie options
    cookieOptions = {
      secure: true,
      domain: config.get('COOKIE_DOMAIN'),
      maxAge: config.get('SESSION_TIMEOUT'),
      sameSite: 'lax',
      priority: 'high',
    };
  } else if (
    config.get('NODE_ENV') === 'development' ||
    config.get('NODE_ENV') === 'test'
  ) {
    // Insecure cookie options
    cookieOptions = {
      secure: false,
      priority: 'high',
      maxAge: config.get('SESSION_TIMEOUT'),
    };
  }

  // Create a session store
  let sessionStore: session.Store | undefined;
  if (
    config.get('NODE_ENV') === 'development' ||
    config.get('NODE_ENV') === 'test'
  ) {
    // Redis session store
    const redisClient = await createClient({
      url: config.get('SESSION_STORAGE_URL'),
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
  if (config.get('NODE_ENV') === 'production') {
    app.enableCors({
      origin: config.get('CORS_ORIGIN'),
      methods: ['GET', 'POST'],
      credentials: true,
    });
  }

  // Add session middleware
  app.use(
    session({
      name: config.get('SESSION_NAME'),
      proxy: config.get('NODE_ENV') === 'production',
      secret: config.get('COOKIE_SECRET'),
      resave: false,
      rolling: true,
      saveUninitialized: false,
      cookie: cookieOptions,
      store: sessionStore,
    }),
  );

  // Add cookie parser middleware
  app.use(cookieParser(config.get('COOKIE_SECRET')));

  // Implement global exception filter
  app.useGlobalFilters(new HttpExceptionFilter(), new PrismaExceptionFilter());

  await app.listen(config.get<number>('PORT'));
  logger.log(`Server is running on: ${await app.getUrl()}`);
}
bootstrap();
