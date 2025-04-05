import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { MobileGoogleOauthService } from 'src/services/mobile/auth/oauth/google_oauth.service';

@Controller('m/auth/oauth/google')
export class MobileGoogleOauthController {
  constructor(private readonly googleOauth: MobileGoogleOauthService) {}

  @Get('login')
  login(): { url: string } {
    return {
      url: this.googleOauth.getLoginUrl(),
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
      refreshToken: string;
    };
  }> {
    const { accessToken, refreshToken } = await this.googleOauth.login(code);

    return {
      message: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    };
  }
}
