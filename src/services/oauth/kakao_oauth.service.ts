import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleAccessToken,
  GoogleProfile,
} from 'src/interfaces/oauth.interface';
import { Config } from 'src/schemas/config.schema';
import { OauthService } from './oauth.service';
import { Provider } from '@prisma/client';
import { TokenService } from '../token.service';

@Injectable()
export class KakaoOauthService {
  private readonly kakaoConfig: Config['oauth']['kakao'];

  constructor(
    private readonly config: ConfigService<Config, true>,
    private readonly oauthService: OauthService,
    private readonly tokenService: TokenService,
  ) {
    this.kakaoConfig = this.config.get<Config['oauth']>('oauth').kakao;
  }

  /**
   * @description Get an access token
   * @param {string} code
   * @returns {Promise<GoogleAccessToken>}
   */
  async getAccessToken(code: string): Promise<GoogleAccessToken> {
    const clientId = this.kakaoConfig.clientId;
    const clientSecret = this.kakaoConfig.clientSecret;
    const redirectUri = this.kakaoConfig.redirectUri;
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

    return (await response.json()) as GoogleAccessToken;
  }

  /**
   * @description Get a profile
   * @param {string} accessToken
   * @returns {Promise<GoogleProfile>}
   */
  async getProfile(accessToken: string): Promise<GoogleProfile> {
    const endpoint = this.kakaoConfig.endpoints.profile;
    const url = `${endpoint}?access_token=${accessToken}`;

    // Make a request to the Google API
    const response = await fetch(url);
    if (!response.ok) {
      throw new UnauthorizedException('Invalid access token');
    }

    return (await response.json()) as GoogleProfile;
  }

  /**
   * @description Login with Google
   * @param {string} code
   * @returns {Promise<{
   *   accessToken: string;
   *   refreshToken: string;
   * }>}
   */
  async login(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { access_token } = await this.getAccessToken(code);
    const profile = await this.getProfile(access_token);

    const existingUser = await this.oauthService
      .getUser({
        provider: Provider.GOOGLE,
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

  loginUrl(): string {
    const clientId = this.kakaoConfig.clientId;
    const redirectUri = this.kakaoConfig.redirectUri;
    const endpoint = this.kakaoConfig.endpoints.auth;
    const url = `${endpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`;

    return url;
  }
}
