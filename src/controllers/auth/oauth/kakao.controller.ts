import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { KakaoOauthService } from 'src/services/oauth/kakao_oauth.service';

@Controller('auth/oauth/kakao')
export class KakaoOauthController {
  constructor(private readonly kakaoOauth: KakaoOauthService) {}

  @Get('login')
  login(): { url: string } {
    return {
      url: this.kakaoOauth.getLoginUrl(),
    };
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Req() req: Request,
  ): Promise<{
    message: string;
    data: {
      accessToken: string;
    };
  }> {
    const { accessToken, refreshToken } = await this.kakaoOauth.login(code);

    // Set refesh token in session
    req.session.refresh = refreshToken;

    return {
      message: 'success',
      data: {
        accessToken,
      },
    };
  }
}
