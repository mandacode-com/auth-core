import { Body, Controller, Post } from '@nestjs/common';
import { MobileKakaoOauthService } from 'src/services/mobile/auth/oauth/kakao_oauth.service';

@Controller('m/auth/oauth/kakao')
export class MobileKakaoOauthController {
  constructor(private readonly kakaoOauth: MobileKakaoOauthService) {}

  @Post('login')
  async login(@Body() data: { accessToken: string }): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { accessToken: oauthAccess } = data;
    return this.kakaoOauth.loginWithAccess({ accessToken: oauthAccess });
  }
}
