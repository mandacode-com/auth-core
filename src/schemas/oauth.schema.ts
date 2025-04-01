import { z } from 'zod';

export const googleAccessTokenSchema = z.object({
  access_token: z.string(),
});

export type GoogleAccessToken = z.infer<typeof googleAccessTokenSchema>;

export const googleProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  verified_email: z.boolean(),
  name: z.string(),
  given_name: z.string(),
  picture: z.string(),
});

export type GoogleProfile = z.infer<typeof googleProfileSchema>;

export const kakaoAccessTokenSchema = z.object({
  token_type: z.string(),
  access_token: z.string(),
  id_token: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
  scope: z.string(),
});

export type KakaoAccessToken = z.infer<typeof kakaoAccessTokenSchema>;

export const kakaoProfileSchema = z.object({
  sub: z.string(),
  nickname: z.string(),
  picture: z.string(),
});

export type KakaoProfile = z.infer<typeof kakaoProfileSchema>;

export const naverAccessTokenSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  error: z.string(),
  error_description: z.string(),
});

export type NaverAccessToken = z.infer<typeof naverAccessTokenSchema>;

export const naverProfileSchema = z.object({
  resultcode: z.string(),
  message: z.string(),
  response: z.object({
    id: z.string(),
    nickname: z.string(),
    email: z.string(),
    profile_image: z.string(),
  }),
});

export type NaverProfile = z.infer<typeof naverProfileSchema>;
