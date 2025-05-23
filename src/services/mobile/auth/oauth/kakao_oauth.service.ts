import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/schemas/config.schema';
import { Provider } from '@prisma/client';
import {
  KakaoAccessToken,
  KakaoProfile,
  kakaoProfileSchema,
} from 'src/schemas/oauth.schema';
import { OauthAccountService } from 'src/services/oauth_account.service';
import { TokenService } from 'src/services/token.service';
import { MobileOauthService } from './mobile_oauth.service';

@Injectable()
export class MobileKakaoOauthService implements MobileOauthService {
  private readonly kakaoConfig: Config['auth']['oauth']['kakao'];

  constructor(
    private readonly config: ConfigService<Config, true>,
    private readonly oauthAccountService: OauthAccountService,
    private readonly tokenService: TokenService,
  ) {
    this.kakaoConfig = this.config.get('auth', { infer: true }).oauth.kakao;
  }

  async loginWithAccess(data: {
    accessToken: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const { accessToken: oauthAccess } = data;
    const profile = await this.getProfile(oauthAccess);
    const existingUser = await this.oauthAccountService
      .getUser({
        provider: Provider.KAKAO,
        providerId: profile.id,
      })
      .catch(async (error) => {
        if (error instanceof NotFoundException) {
          return await this.oauthAccountService.createUser({
            provider: Provider.KAKAO,
            providerId: profile.id,
            email: profile.email,
            nickname: profile.nickname,
          });
        }
        throw error;
      });
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.accessToken({
        uuid: existingUser.uuid,
        role: existingUser.role,
      }),
      this.tokenService.refreshToken({
        uuid: existingUser.uuid,
        role: existingUser.role,
      }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async getAccessToken(code: string): Promise<{ accessToken: string }> {
    const clientId = this.kakaoConfig.clientId;
    const clientSecret = this.kakaoConfig.clientSecret;
    const redirectUri = this.kakaoConfig.redirectUris.mobile;
    const grantType = this.kakaoConfig.grantType;
    const endpoint = this.kakaoConfig.endpoints.token;
    const url = `${endpoint}?client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&code=${code}&grant_type=${grantType}`;

    // Make a request to the Google API
    const response = await fetch(url, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new UnauthorizedException('Invalid code');
    }

    // return (await response.json()) as KakaoAccessToken;
    const data = (await response.json()) as KakaoAccessToken;
    return {
      accessToken: data.access_token,
    };
  }

  async getProfile(accessToken: string): Promise<{
    id: string;
    email: string;
    nickname: string;
  }> {
    const endpoint = this.kakaoConfig.endpoints.profile;
    const url = `${endpoint}?access_token=${accessToken}`;

    // Make a request to the Google API
    const response = await fetch(url);
    if (!response.ok) {
      throw new UnauthorizedException('Invalid access token');
    }

    const data = (await response.json()) as KakaoProfile;
    const parsedData = await kakaoProfileSchema.parseAsync(data);
    if (
      !parsedData.kakao_account.has_email ||
      !parsedData.kakao_account.is_email_valid ||
      !parsedData.kakao_account.is_email_verified
    ) {
      throw new UnauthorizedException('Invalid email');
    }
    return {
      id: parsedData.id.toString(),
      email: parsedData.kakao_account.email,
      nickname: parsedData.properties.nickname,
    };
  }

  async login(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { accessToken: OauthAccessToken } = await this.getAccessToken(code);
    const profile = await this.getProfile(OauthAccessToken);

    const existingUser = await this.oauthAccountService
      .getUser({
        provider: Provider.KAKAO,
        providerId: profile.id,
      })
      .catch(async (error) => {
        if (error instanceof NotFoundException) {
          return await this.oauthAccountService.createUser({
            provider: Provider.KAKAO,
            providerId: profile.id,
            email: profile.email,
            nickname: profile.nickname,
          });
        }

        throw error;
      });

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.accessToken({
        uuid: existingUser.uuid,
        role: existingUser.role,
      }),
      this.tokenService.refreshToken({
        uuid: existingUser.uuid,
        role: existingUser.role,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  getLoginUrl(): string {
    const clientId = this.kakaoConfig.clientId;
    const redirectUri = this.kakaoConfig.redirectUris.mobile;
    const endpoint = this.kakaoConfig.endpoints.auth;
    const url = `${endpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=account_email%20profile_nickname`;

    return url;
  }
}
