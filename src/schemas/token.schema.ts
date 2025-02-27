import { z } from 'zod';
import { roleSchema } from './role.schema';

export const emailConfrimationTokenPayloadSchema = z.object({
  email: z.string().email(),
  code: z.string().min(6),
});

export const accessTokenPayloadSchema = z.object({
  uuid: z.string().uuid(),
  role: roleSchema,
});

export const refreshTokenPayloadSchema = z.object({
  uuid: z.string().uuid(),
  role: roleSchema,
});

export type EmailConfrimationTokenPayload = z.infer<
  typeof emailConfrimationTokenPayloadSchema
>;
export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;
export type RefreshTokenPayload = z.infer<typeof refreshTokenPayloadSchema>;
