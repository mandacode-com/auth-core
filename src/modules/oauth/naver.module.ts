import { Module } from '@nestjs/common';
import { OauthModule } from './oauth.module';
import { TokenServiceModule } from 'src/modules/token_service.module';
import { NaverOauthController } from 'src/controllers/oauth/naver.controller';
import { NaverOauthService } from 'src/services/oauth/naver_oauth.service';

@Module({
  imports: [TokenServiceModule, OauthModule],
  controllers: [NaverOauthController],
  providers: [NaverOauthService],
})
export class NaverOauthModule {}
