import { z } from 'zod';

export const emailConfrimationTokenPayloadSchema = z.object({
  email: z.string().email(),
  code: z.string().min(6),
});

export const accessTokenPayloadSchema = z.object({
  uuid: z.string().uuid(),
});

export const refreshTokenPayloadSchema = z.object({
  uuid: z.string().uuid(),
});

export type EmailConfrimationTokenPayload = z.infer<
  typeof emailConfrimationTokenPayloadSchema
>;
export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;
export type RefreshTokenPayload = z.infer<typeof refreshTokenPayloadSchema>;
