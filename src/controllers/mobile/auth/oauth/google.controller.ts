import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ResponseData } from 'src/interfaces/response.interface';
import { MobileGoogleOauthService } from 'src/services/mobile/auth/oauth/google_oauth.service';

@Controller('m/auth/oauth/google')
export class MobileGoogleOauthController {
  constructor(private readonly googleOauth: MobileGoogleOauthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() data: { accessToken: string; idToken: string },
  ): Promise<ResponseData<{ accessToken: string; refreshToken: string }>> {
    const { accessToken: oauthAccess, idToken } = data;
    const { accessToken, refreshToken } =
      await this.googleOauth.loginWithAccess({
        accessToken: oauthAccess,
        idToken,
      });
    return {
      message: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    };
  }
}
