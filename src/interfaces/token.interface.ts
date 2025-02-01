export interface EmailConfrimationTokenPayload {
  email: string;
  code: string;
}

export interface AccessTokenPayload {
  uuid: string;
}

export interface RefreshTokenPayload {
  uuid: string;
}
