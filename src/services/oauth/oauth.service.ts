export interface OauthService {
  /**
   * @description Get the login URL
   * @returns {string}
   */
  getLoginUrl(): string;

  /**
   * @description Get an access token
   * @param {string} code
   * @returns {Promise<{ accessToken: string }>}
   */
  getAccessToken(code: string): Promise<{
    accessToken: string;
  }>;

  /**
   * @description Get a user profile
   * @param {string} accessToken
   * @returns {Promise<{ id: string; nickname: string | undefined; email: string | undefined }>}
   */
  getProfile(accessToken: string): Promise<{
    id: string;
    nickname: string | undefined;
    email: string | undefined;
  }>;

  /**
   * @description Login
   * @param {string} code
   * @returns {Promise<{ accessToken: string; refreshToken: string }>}
   */
  login(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
}
