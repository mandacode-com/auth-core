import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/schemas/config.schema';
import { Provider } from '@prisma/client';
import {
  GoogleAccessToken,
  GoogleProfile,
  googleProfileSchema,
} from 'src/schemas/oauth.schema';
import { OauthAccountService } from 'src/services/oauth_account.service';
import { TokenService } from 'src/services/token.service';
import { MobileOauthService } from './mobile_oauth.service';

@Injectable()
export class MobileGoogleOauthService implements MobileOauthService {
  private readonly googleConfig: Config['auth']['oauth']['google'];

  constructor(
    private readonly config: ConfigService<Config, true>,
    private readonly oauthAccountService: OauthAccountService,
    private readonly tokenService: TokenService,
  ) {
    this.googleConfig = this.config.get('auth', { infer: true }).oauth.google;
  }

  async getAccessToken(code: string): Promise<{
    accessToken: string;
  }> {
    const clientId = this.googleConfig.clientId;
    const clientSecret = this.googleConfig.clientSecret;
    const redirectUri = this.googleConfig.redirectUris.mobile;
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

  async login(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { accessToken: oauthAccessToken } = await this.getAccessToken(code);
    const profile = await this.getProfile(oauthAccessToken);

    const existingUser = await this.oauthAccountService
      .getUser({
        provider: Provider.GOOGLE,
        providerId: profile.id,
      })
      .catch(async (error) => {
        if (error instanceof NotFoundException) {
          return await this.oauthAccountService.createUser({
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

  async loginWithAccess(data: {
    accessToken: string;
    idToken: string;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { accessToken: oauthAccess, idToken } = data;

    const profile = await this.getProfile(oauthAccess);

    const existingUser = await this.oauthAccountService
      .getUser({
        provider: Provider.GOOGLE,
        providerId: profile.id,
      })
      .catch(async (error) => {
        if (error instanceof NotFoundException) {
          return await this.oauthAccountService.createUser({
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
    const redirectUri = this.googleConfig.redirectUris.mobile;
    const endpoint = this.googleConfig.endpoints.auth;
    const url = `${endpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`;

    return url;
  }
}
