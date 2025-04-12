import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ResponseData } from 'src/interfaces/response.interface';
import { MobileNaverOauthService } from 'src/services/mobile/auth/oauth/naver_oauth.service';

@Controller('m/auth/oauth/naver')
export class MobileNaverOauthController {
  constructor(private readonly naverOauth: MobileNaverOauthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() data: { accessToken: string },
  ): Promise<ResponseData<{ accessToken: string; refreshToken: string }>> {
    const { accessToken: oauthAccess } = data;
    const { accessToken, refreshToken } = await this.naverOauth.loginWithAccess(
      {
        accessToken: oauthAccess,
      },
    );
    return {
      message: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    };
  }
}
