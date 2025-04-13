import { Controller, Get, HttpCode, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ResponseData } from 'src/interfaces/response.interface';
import { KakaoOauthService } from 'src/services/web/auth/oauth/kakao_oauth.service';

@Controller('auth/oauth/kakao')
export class KakaoOauthController {
  constructor(private readonly kakaoOauth: KakaoOauthService) {}

  @Get('login')
  @HttpCode(200)
  login(): { url: string } {
    return {
      url: this.kakaoOauth.getLoginUrl(),
    };
  }

  @Get('callback')
  @HttpCode(200)
  async callback(
    @Query('code') code: string,
    @Req() req: Request,
  ): Promise<ResponseData<{ accessToken: string }>> {
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
