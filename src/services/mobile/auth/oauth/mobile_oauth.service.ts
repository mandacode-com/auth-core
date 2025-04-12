import { OauthService } from 'src/services/oauth.service';

export interface MobileOauthService extends OauthService {
  /**
   * @description Login with access token
   * @param {{ accessToken: string }} data { accessToken: string }
   * @returns {Promise<{ accessToken: string; refreshToken: string }>}
   */
  loginWithAccess(data: { accessToken: string }): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
}
