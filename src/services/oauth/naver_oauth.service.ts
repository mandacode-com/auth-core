import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/schemas/config.schema';
import { OauthService } from './oauth.service';
import { TokenService } from '../token.service';
import { Provider } from '@prisma/client';
import { NaverProfile, naverProfileSchema } from 'src/schemas/oauth.schema';
import { OauthImpl } from './oauth_impl';

@Injectable()
export class NaverOauthService implements OauthImpl {
  private readonly naverConfig: Config['oauth']['naver'];

  constructor(
    private readonly config: ConfigService<Config, true>,
    private readonly oauthService: OauthService,
    private readonly tokenService: TokenService,
  ) {
    this.naverConfig = this.config.get<Config['oauth']>('oauth').naver;
  }

  /**
   * @description Get an access token
   * @param {string} code
   * @returns {Promise<{ accessToken: string; refreshToken: string }>}
   */
  async getAccessToken(
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const clientId = this.naverConfig.clientId;
    const clientSecret = this.naverConfig.clientSecret;
    const redirectUri = this.naverConfig.redirectUri;
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

  /**
   * @description Get a profile
   * @param {string} accessToken
   * @returns {Promise<{
   *  id: string;
   *  email: string;
   *  nickname: string;
   * }>}
   */
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

  /**
   * @description Login with Naver
   * @param {string} code
   * @returns {Promise<{ accessToken: string; refreshToken: string }>}
   */
  async login(
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { accessToken: oauthAccessToken } = await this.getAccessToken(code);
    const profile = await this.getProfile(oauthAccessToken);

    const existingUser = await this.oauthService
      .getUser({
        provider: Provider.NAVER,
        providerId: profile.id,
      })
      .catch(async (error) => {
        if (error instanceof NotFoundException) {
          return await this.oauthService.createUser({
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

  /**
   * @description Get the login URL
   * @returns {string}
   */
  getLoginUrl(): string {
    const clientId = this.naverConfig.clientId;
    const redirectUri = this.naverConfig.redirectUri;
    const endpoint = this.naverConfig.endpoints.auth;
    const url = `${endpoint}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;

    return url;
  }
}
