import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/validate';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { WebModule } from './modules/web/web.module';
import { MobileModule } from './modules/mobile/mobile.module';

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
    WebModule,
    MobileModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
