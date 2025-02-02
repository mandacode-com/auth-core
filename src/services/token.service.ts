import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import {
  AccessTokenPayload,
  accessTokenPayloadSchema,
  EmailConfrimationTokenPayload,
  emailConfrimationTokenPayloadSchema,
  RefreshTokenPayload,
  refreshTokenPayloadSchema,
} from 'src/schemas/token.schema';
import { Config } from 'src/schemas/config.schema';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Config, true>,
  ) {}

  /**
   * @description Generate access token
   * @param {AccessTokenPayload} payload
   * @returns {Promise<string>}
   * @memberof TokenService
   */
  async accessToken(
    payload: AccessTokenPayload,
    options?: JwtSignOptions,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      ...options,
    });
  }

  /**
   * @description Verify access token
   * @param {string} accessToken
   * @returns {Promise<AccessTokenPayload>}
   * @memberof TokenService
   */
  async verifyAccessToken(
    accessToken: string,
    options?: JwtVerifyOptions,
  ): Promise<AccessTokenPayload> {
    return this.jwtService
      .verifyAsync<AccessTokenPayload>(accessToken, {
        secret: this.configService.get('JWT_SECRET'),
        ...options,
      })
      .then(async (payload) => {
        return accessTokenPayloadSchema.parseAsync(payload).catch(() => {
          throw new BadRequestException('Invalid access token');
        });
      });
  }

  /**
   * @description Generate refresh token
   * @param {RefreshTokenPayload} payload
   * @returns {Promise<string>}
   * @memberof TokenService
   */
  async refreshToken(
    payload: RefreshTokenPayload,
    options?: JwtSignOptions,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      ...options,
    });
  }

  /**
   * @description Verify refresh token
   * @param {string} refreshToken
   * @returns {Promise<RefreshTokenPayload>}
   * @memberof TokenService
   */
  async verifyRefreshToken(
    refreshToken: string,
    options?: JwtVerifyOptions,
  ): Promise<RefreshTokenPayload> {
    return this.jwtService
      .verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
        ...options,
      })
      .then(async (payload) => {
        return refreshTokenPayloadSchema.parseAsync(payload).catch(() => {
          throw new BadRequestException('Invalid refresh token');
        });
      });
  }

  /**
   * @description Generate email confirmation token
   * @param {EmailConfrimationTokenPayload} payload
   * @returns {Promise<string>}
   * @memberof TokenService
   */
  async emailConfirmToken(
    payload: EmailConfrimationTokenPayload,
    options?: JwtSignOptions,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      ...options,
    });
  }

  /**
   * @description Verify email confirmation token
   * @param {string} emailConfirmToken
   * @returns {Promise<EmailConfrimationTokenPayload>}
   * @memberof TokenService
   */
  async verifyEmailConfirmToken(
    emailConfirmToken: string,
    options?: JwtVerifyOptions,
  ): Promise<EmailConfrimationTokenPayload> {
    return this.jwtService
      .verifyAsync<EmailConfrimationTokenPayload>(emailConfirmToken, {
        secret: this.configService.get('JWT_SECRET'),
        ...options,
      })
      .then(async (payload) => {
        return emailConfrimationTokenPayloadSchema
          .parseAsync(payload)
          .catch(() => {
            throw new BadRequestException('Invalid email confirmation token');
          });
      });
  }
}
