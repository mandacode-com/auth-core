import { Body, Controller, Post } from '@nestjs/common';
import { ResponseData } from 'src/interfaces/response.interface';
import { MobileKakaoOauthService } from 'src/services/mobile/auth/oauth/kakao_oauth.service';

@Controller('m/auth/oauth/kakao')
export class MobileKakaoOauthController {
  constructor(private readonly kakaoOauth: MobileKakaoOauthService) {}

  @Post('login')
  async login(@Body() data: { accessToken: string }): Promise<
    ResponseData<{
      accessToken: string;
      refreshToken: string;
    }>
  > {
    const { accessToken: oauthAccess } = data;
    const { accessToken, refreshToken } = await this.kakaoOauth.loginWithAccess(
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
