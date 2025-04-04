import { Controller, Get, Query } from '@nestjs/common';
import { MobileNaverOauthService } from 'src/services/mobile/auth/oauth/naver_oauth.service';

@Controller('m/auth/oauth/naver')
export class MobileNaverOauthController {
  constructor(private readonly naverOauth: MobileNaverOauthService) {}

  @Get('login')
  login(): { url: string } {
    return {
      url: this.naverOauth.getLoginUrl(),
    };
  }

  @Get('callback')
  async callback(@Query('code') code: string): Promise<{
    message: string;
    data: {
      accessToken: string;
      refreshToken: string;
    };
  }> {
    const { accessToken, refreshToken } = await this.naverOauth.login(code);

    return {
      message: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    };
  }
}
