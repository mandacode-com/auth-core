import { Module } from '@nestjs/common';
import { OauthAccountModule } from './oauth_account.module';
import { TokenServiceModule } from 'src/modules/token_service.module';
import { NaverOauthController } from 'src/controllers/oauth/naver.controller';
import { NaverOauthService } from 'src/services/oauth/naver_oauth.service';

@Module({
  imports: [TokenServiceModule, OauthAccountModule],
  controllers: [NaverOauthController],
  providers: [NaverOauthService],
})
export class NaverOauthModule {}
