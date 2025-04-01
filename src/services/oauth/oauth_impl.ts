export interface OauthImpl {
  getLoginUrl(): string;
  getAccessToken(code: string): Promise<{
    accessToken: string;
  }>;
  getProfile(accessToken: string): Promise<{
    id: string;
    nickname: string | undefined;
    email: string | undefined;
  }>;
  login(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
}
