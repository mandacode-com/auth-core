import { Module } from '@nestjs/common';
import { OauthAccountModule } from './oauth_account.module';
import { GoogleOauthController } from 'src/controllers/oauth/google.controller';
import { GoogleOauthService } from 'src/services/oauth/google_oauth.service';
import { TokenServiceModule } from 'src/modules/token_service.module';

@Module({
  imports: [TokenServiceModule, OauthAccountModule],
  controllers: [GoogleOauthController],
  providers: [GoogleOauthService],
})
export class GoogleOauthModule {}
