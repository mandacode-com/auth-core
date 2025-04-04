import { Module } from '@nestjs/common';
import { TokenModule } from './token.module';
import { SessionModule } from './session.module';
import { AuthLocalModule } from './auth/auth_local.module';
import { GoogleOauthModule } from './auth/oauth/google.module';
import { KakaoOauthModule } from './auth/oauth/kakao.module';
import { NaverOauthModule } from './auth/oauth/naver.module';

@Module({
  imports: [
    TokenModule,
    SessionModule,
    AuthLocalModule,
    GoogleOauthModule,
    KakaoOauthModule,
    NaverOauthModule,
  ],
})
export class WebModule {}
