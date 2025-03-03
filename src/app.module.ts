import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/validate';
import { SessionModule } from './modules/session.module';
import { AuthLocalModule } from './modules/auth/local.module';
import { CacheModule } from '@nestjs/cache-manager';
import { TokenModule } from './modules/token.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validate,
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 30000,
      max: 1000,
    }),
    AuthLocalModule,
    SessionModule,
    TokenModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
