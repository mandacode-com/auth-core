import { Module } from '@nestjs/common';
import { TokenServiceModule } from 'src/modules/token_service.module';
import { OauthAccountModule } from 'src/modules/oauth_account.module';
import { MobileKakaoOauthController } from 'src/controllers/mobile/auth/oauth/kakao.controller';
import { MobileKakaoOauthService } from 'src/services/mobile/auth/oauth/kakao_oauth.service';

@Module({
  imports: [TokenServiceModule, OauthAccountModule],
  controllers: [MobileKakaoOauthController],
  providers: [MobileKakaoOauthService],
})
export class MobileKakaoOauthModule {}
