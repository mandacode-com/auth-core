import { Controller, Get, Query, Req } from '@nestjs/common';
import { MobileKakaoOauthService } from 'src/services/mobile/auth/oauth/kakao_oauth.service';

@Controller('m/auth/oauth/kakao')
export class MobileKakaoOauthController {
  constructor(private readonly kakaoOauth: MobileKakaoOauthService) {}

  @Get('login')
  login(): { url: string } {
    return {
      url: this.kakaoOauth.getLoginUrl(),
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
    const { accessToken, refreshToken } = await this.kakaoOauth.login(code);

    return {
      message: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    };
  }
}
