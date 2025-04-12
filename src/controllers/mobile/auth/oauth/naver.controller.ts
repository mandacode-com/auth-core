import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { MobileNaverOauthService } from 'src/services/mobile/auth/oauth/naver_oauth.service';

@Controller('m/auth/oauth/naver')
export class MobileNaverOauthController {
  constructor(private readonly naverOauth: MobileNaverOauthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() data: { accessToken: string },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { accessToken: oauthAccess } = data;
    return this.naverOauth.loginWithAccess({
      accessToken: oauthAccess,
    });
  }
}
