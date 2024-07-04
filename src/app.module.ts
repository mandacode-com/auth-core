import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/validate';
import { AuthModule } from './modules/auth.module';
import { AppController } from './controllers/app.controller';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validate,
      isGlobal: true,
    }),
    AuthModule,
    LoggerModule.forRoot({
      pinoHttp: {
        stream: pino.destination({
          dest: 'logs/app.log',
          sync: false,
          mkdir: true,
        }),
      },
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
