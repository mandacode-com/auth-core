import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/schemas/config.schema';
import { Provider } from '@prisma/client';
import { NaverProfile, naverProfileSchema } from 'src/schemas/oauth.schema';
import { OauthAccountService } from 'src/services/oauth_account.service';
import { TokenService } from 'src/services/token.service';
import { MobileOauthService } from './mobile_oauth.service';

@Injectable()
export class MobileNaverOauthService implements MobileOauthService {
  private readonly naverConfig: Config['auth']['oauth']['naver'];

  constructor(
    private readonly config: ConfigService<Config, true>,
    private readonly oauthAccountService: OauthAccountService,
    private readonly tokenService: TokenService,
  ) {
    this.naverConfig = this.config.get('auth', { infer: true }).oauth.naver;
  }

  async loginWithAccess(data: {
    accessToken: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const { accessToken: oauthAccess } = data;
    const profile = await this.getProfile(oauthAccess);
    const existingUser = await this.oauthAccountService
      .getUser({
        provider: Provider.NAVER,
        providerId: profile.id,
      })
      .catch(async (error) => {
        if (error instanceof NotFoundException) {
          return await this.oauthAccountService.createUser({
            provider: Provider.NAVER,
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

  async getAccessToken(
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const clientId = this.naverConfig.clientId;
    const clientSecret = this.naverConfig.clientSecret;
    const redirectUri = this.naverConfig.redirectUris.mobile;
    const grantType = this.naverConfig.grantType;
    const endpoint = this.naverConfig.endpoints.token;
    const url = `${endpoint}?client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&code=${code}&grant_type=${grantType}`;

    // Make a request to the Naver API
    const response = await fetch(url, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new UnauthorizedException('Invalid code');
    }

    const data = (await response.json()) as {
      access_token: string | undefined;
      refresh_token: string | undefined;
    };

    if (!data.access_token || !data.refresh_token) {
      throw new UnauthorizedException('Invalid code');
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  }

  async getProfile(accessToken: string): Promise<{
    id: string;
    email: string;
    nickname: string;
  }> {
    const endpoint = this.naverConfig.endpoints.profile;
    const url = `${endpoint}?access_token=${accessToken}`;

    // Make a request to the Naver API
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Invalid access token');
    }

    const data = (await response.json()) as NaverProfile;

    const parsedData = await naverProfileSchema.parseAsync(data);

    if (parsedData.resultcode !== '00') {
      throw new UnauthorizedException('Invalid access token');
    }

    return {
      id: parsedData.response.id.toString(),
      email: parsedData.response.email,
      nickname: parsedData.response.nickname,
    };
  }

  async login(
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { accessToken: oauthAccessToken } = await this.getAccessToken(code);
    return this.loginWithAccess({
      accessToken: oauthAccessToken,
    });
  }

  getLoginUrl(): string {
    const clientId = this.naverConfig.clientId;
    const redirectUri = this.naverConfig.redirectUris.mobile;
    const endpoint = this.naverConfig.endpoints.auth;
    const url = `${endpoint}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;

    return url;
  }
}
