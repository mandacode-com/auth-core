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
import fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const logger = new Logger();
  const config = app.get(ConfigService<IConfig, true>);

  // Create a log file and directory if it doesn't exist
  const logDir = 'logs';
  const logFile = 'app.log';
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  if (!fs.existsSync(`${logDir}/${logFile}`)) {
    fs.writeFileSync(`${logDir}/${logFile}`, '');
  }

  const sessionConfig = config.get<ISessionConfig>('session');
  const cookieConfig = config.get<ICookieConfig>('cookie');
  const redisConfig = config.get<IRedisConfig>('redis');

  // Session configuration
  let cookieOptions: session.CookieOptions = {};
  let sessionStore: session.Store | undefined;
  if (config.get('nodeEnv') === 'production') {
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

    // Secure cookie options
    cookieOptions = {
      secure: true,
      maxAge: sessionConfig.timeout,
      sameSite: 'lax',
      priority: 'high',
    };
  } else if (config.get('nodeEnv') === 'development') {
    // Insecure cookie options
    cookieOptions = {
      secure: false,
      priority: 'high',
      maxAge: sessionConfig.timeout,
    };
  } else if (config.get('nodeEnv') === 'test') {
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

    // Insecure cookie options
    cookieOptions = {
      secure: false,
      priority: 'high',
      maxAge: sessionConfig.timeout,
    };
  }

  // Add session middleware
  app.use(
    session({
      name: sessionConfig.name,
      secret: sessionConfig.secret,
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
