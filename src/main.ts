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
  if (config.get<Config['server']>('server').nodeEnv === 'production') {
    // Secure cookie options
    cookieOptions = {
      secure: true,
      domain: config.get<Config['cookie']>('cookie').domain,
      sameSite: 'lax',
      priority: 'high',
    };
  } else if (
    config.get<Config['server']>('server').nodeEnv === 'development' ||
    config.get<Config['server']>('server').nodeEnv === 'test'
  ) {
    // Insecure cookie options
    cookieOptions = {
      secure: false,
      priority: 'high',
    };
  }

  // Create a session store
  let sessionStore: session.Store | undefined;
  if (
    config.get<Config['server']>('server').nodeEnv === 'development' ||
    config.get<Config['server']>('server').nodeEnv === 'test'
  ) {
    // Redis session store
    const redisClient = await createClient({
      url: config.get<Config['session']>('session').storageUrl,
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
  if (config.get<Config['server']>('server').nodeEnv === 'production') {
    app.enableCors({
      origin: config.get<Config['cors']>('cors').origin,
      methods: ['GET', 'POST'],
      credentials: true,
    });
  }

  // Add session middleware
  app.use(
    session({
      name: config.get<Config['session']>('session').name,
      proxy: config.get<Config['server']>('server').nodeEnv === 'production',
      secret: config.get<Config['cookie']>('cookie').secret,
      resave: false,
      rolling: true,
      saveUninitialized: false,
      cookie: cookieOptions,
      store: sessionStore,
    }),
  );

  // Add cookie parser middleware
  app.use(cookieParser(config.get<Config['cookie']>('cookie').secret));

  // Implement global exception filter
  app.useGlobalFilters(new HttpExceptionFilter(), new PrismaExceptionFilter());

  await app.listen(config.get<Config['server']>('server').port);
  logger.log(`Server is running on: ${await app.getUrl()}`);
}
bootstrap();
