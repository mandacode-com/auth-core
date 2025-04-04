import { Module } from '@nestjs/common';
import { TokenServiceModule } from 'src/modules/token_service.module';
import { OauthAccountModule } from 'src/modules/oauth_account.module';
import { MobileGoogleOauthController } from 'src/controllers/mobile/auth/oauth/google.controller';
import { MobileGoogleOauthService } from 'src/services/mobile/auth/oauth/google_oauth.service';

@Module({
  imports: [TokenServiceModule, OauthAccountModule],
  controllers: [MobileGoogleOauthController],
  providers: [MobileGoogleOauthService],
})
export class MobileGoogleOauthModule {}
