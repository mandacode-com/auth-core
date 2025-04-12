import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ResponseData } from 'src/interfaces/response.interface';
import { GoogleOauthService } from 'src/services/web/auth/oauth/google_oauth.service';

@Controller('auth/oauth/google')
export class GoogleOauthController {
  constructor(private readonly googleOauth: GoogleOauthService) {}

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
  ): Promise<ResponseData<{ accessToken: string }>> {
    const { accessToken, refreshToken } = await this.googleOauth.login(code);

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
