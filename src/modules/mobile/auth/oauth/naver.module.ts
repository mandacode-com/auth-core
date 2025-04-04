import { Module } from '@nestjs/common';
import { TokenServiceModule } from 'src/modules/token_service.module';
import { OauthAccountModule } from 'src/modules/oauth_account.module';
import { MobileNaverOauthController } from 'src/controllers/mobile/auth/oauth/naver.controller';
import { MobileNaverOauthService } from 'src/services/mobile/auth/oauth/naver_oauth.service';

@Module({
  imports: [TokenServiceModule, OauthAccountModule],
  controllers: [MobileNaverOauthController],
  providers: [MobileNaverOauthService],
})
export class MobileNaverOauthModule {}
