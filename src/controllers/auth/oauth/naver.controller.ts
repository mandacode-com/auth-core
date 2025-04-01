import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { NaverOauthService } from 'src/services/oauth/naver_oauth.service';

@Controller('auth/oauth/naver')
export class NaverOauthController {
  constructor(private readonly naverOauth: NaverOauthService) {}

  @Get('login')
  login(): { url: string } {
    return {
      url: this.naverOauth.loginUrl(),
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
    const { accessToken, refreshToken } = await this.naverOauth.login(code);

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
