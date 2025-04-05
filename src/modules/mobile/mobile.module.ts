import { Module } from '@nestjs/common';
import { MobileTokenModule } from './token.module';
import { MobileAuthLocalModule } from './auth/auth_local.module';
import { MobileGoogleOauthModule } from './auth/oauth/google.module';
import { MobileKakaoOauthModule } from './auth/oauth/kakao.module';
import { MobileNaverOauthModule } from './auth/oauth/naver.module';

@Module({
  imports: [
    MobileTokenModule,
    MobileAuthLocalModule,
    MobileGoogleOauthModule,
    MobileKakaoOauthModule,
    MobileNaverOauthModule,
  ],
})
export class MobileModule {}
