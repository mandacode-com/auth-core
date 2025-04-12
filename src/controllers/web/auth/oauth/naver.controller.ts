import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ResponseData } from 'src/interfaces/response.interface';
import { NaverOauthService } from 'src/services/web/auth/oauth/naver_oauth.service';

@Controller('auth/oauth/naver')
export class NaverOauthController {
  constructor(private readonly naverOauth: NaverOauthService) {}

  @Get('login')
  login(): { url: string } {
    return {
      url: this.naverOauth.getLoginUrl(),
    };
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Req() req: Request,
  ): Promise<ResponseData<{ accessToken: string }>> {
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
