export interface GoogleAccessToken {
  access_token: string;
}

export interface GoogleProfile {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  picture: string;
}

export interface KakaoAccessToken {
  token_type: string;
  access_token: string;
  id_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface KakaoProfile {
  sub: string;
  nickname: string;
  picture: string;
}

export interface NaverAccessToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  error: string;
  error_description: string;
}

export interface NaverProfile {
  resultcode: string;
  message: string;
  response: {
    id: string;
    nickname: string;
    email: string;
    profile_image: string;
  };
}
