import { Module } from '@nestjs/common';
import { OauthAccountModule } from './oauth_account.module';
import { TokenServiceModule } from 'src/modules/token_service.module';
import { KakaoOauthService } from 'src/services/oauth/kakao_oauth.service';
import { KakaoOauthController } from 'src/controllers/oauth/kakao.controller';

@Module({
  imports: [TokenServiceModule, OauthAccountModule],
  controllers: [KakaoOauthController],
  providers: [KakaoOauthService],
})
export class KakaoOauthModule {}
