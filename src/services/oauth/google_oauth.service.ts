import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/schemas/config.schema';
import { OauthService } from './oauth.service';
import { Provider } from '@prisma/client';
import { TokenService } from '../token.service';
import {
  GoogleAccessToken,
  GoogleProfile,
  googleProfileSchema,
} from 'src/schemas/oauth.schema';
import { OauthImpl } from './oauth_impl';

@Injectable()
export class GoogleOauthService implements OauthImpl {
  private readonly googleConfig: Config['oauth']['google'];

  constructor(
    private readonly config: ConfigService<Config, true>,
    private readonly oauthService: OauthService,
    private readonly tokenService: TokenService,
  ) {
    this.googleConfig = this.config.get<Config['oauth']>('oauth').google;
  }

  /**
   * @description Get an access token
   * @param {string} code
   * @returns {Promise<{ accessToken: string }>}
   * @throws {UnauthorizedException} Invalid code
   */
  async getAccessToken(code: string): Promise<{
    accessToken: string;
  }> {
    const clientId = this.googleConfig.clientId;
    const clientSecret = this.googleConfig.clientSecret;
    const redirectUri = this.googleConfig.redirectUri;
    const grantType = this.googleConfig.grantType;
    const endpoint = this.googleConfig.endpoints.token;
    const url = `${endpoint}?client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&code=${code}&grant_type=${grantType}`;

    // Make a request to the Google API
    const response = await fetch(url, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new UnauthorizedException('Invalid code');
    }

    const data = (await response.json()) as GoogleAccessToken;
    return {
      accessToken: data.access_token,
    };
  }

  /**
   * @description Get a profile
   * @param {string} accessToken
   * @returns {Promise<GoogleProfile>}
   */
  async getProfile(accessToken: string): Promise<{
    id: string;
    email: string;
    nickname: string;
  }> {
    const endpoint = this.googleConfig.endpoints.profile;
    const url = `${endpoint}?access_token=${accessToken}`;

    // Make a request to the Google API
    const response = await fetch(url);
    if (!response.ok) {
      throw new UnauthorizedException('Invalid access token');
    }

    const data = (await response.json()) as GoogleProfile;

    const parsedData = await googleProfileSchema.parseAsync(data);
    if (!parsedData.email_verified) {
      throw new UnauthorizedException('Invalid email');
    }

    return {
      id: data.sub,
      email: data.email,
      nickname: data.name,
    };
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
    const { accessToken: OauthAccessToken } = await this.getAccessToken(code);
    const profile = await this.getProfile(OauthAccessToken);

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
    const clientId = this.googleConfig.clientId;
    const redirectUri = this.googleConfig.redirectUri;
    const endpoint = this.googleConfig.endpoints.auth;
    const url = `${endpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`;

    return url;
  }
}
