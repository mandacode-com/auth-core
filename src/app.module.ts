import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/validate';
import { AuthModule } from './modules/auth.module';
import { AppController } from './controllers/app.controller';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validate,
      isGlobal: true,
    }),
    AuthModule,
    JwtModule.register({
      signOptions: { expiresIn: '1d' },
      secret: process.env.JWT_SECRET,
      global: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        stream: pino.destination({
          dest: 'logs/app.log',
          sync: false,
          mkdir: true,
        }),
      },
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 30000,
      max: 1000,
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
