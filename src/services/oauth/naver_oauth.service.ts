import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/schemas/config.schema';
import { OauthService } from './oauth.service';
import { TokenService } from '../token.service';
import { GoogleProfile } from 'src/interfaces/oauth.interface';
import { Provider } from '@prisma/client';

@Injectable()
export class NaverOauthService {
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
      throw new Error('Invalid code');
    }

    return (await response.json()) as {
      accessToken: string;
      refreshToken: string;
    };
  }

  /**
   * @description Get a profile
   * @param {string} accessToken
   * @returns {Promise<any>}
   */
  async getProfile(accessToken: string): Promise<GoogleProfile> {
    const endpoint = this.naverConfig.endpoints.profile;
    const url = `${endpoint}?access_token=${accessToken}`;

    // Make a request to the Naver API
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Invalid access token');
    }

    return (await response.json()) as GoogleProfile;
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
            provider: Provider.GOOGLE,
            providerId: profile.id,
            email: profile.email,
            nickname: profile.name,
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
  loginUrl(): string {
    const clientId = this.naverConfig.clientId;
    const redirectUri = this.naverConfig.redirectUri;
    const endpoint = this.naverConfig.endpoints.auth;
    const url = `${endpoint}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;

    return url;
  }
}
