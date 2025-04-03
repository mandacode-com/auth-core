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
  private readonly jwtConfig: Config['jwt'];
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Config, true>,
  ) {
    this.jwtConfig = this.configService.get<Config['jwt']>('jwt');
  }

  /**
   * @description Generate access token
   * @param {AccessTokenPayload} payload
   * @param {JwtSignOptions} [options]
   * @returns {Promise<string>}
   */
  async accessToken(
    payload: AccessTokenPayload,
    options?: JwtSignOptions,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      privateKey: this.jwtConfig.access.private,
      expiresIn: this.jwtConfig.access.expiresIn,
      algorithm: 'RS256',
      ...options,
    });
  }

  /**
   * @description Verify access token
   * @param {string} accessToken
   * @param {JwtVerifyOptions} [options]
   * @returns {Promise<AccessTokenPayload>}
   */
  async verifyAccessToken(
    accessToken: string,
    options?: JwtVerifyOptions,
  ): Promise<AccessTokenPayload> {
    return this.jwtService
      .verifyAsync<AccessTokenPayload>(accessToken, {
        publicKey: this.jwtConfig.access.public,
        algorithms: ['RS256'],
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
   * @param {JwtSignOptions} [options]
   * @returns {Promise<string>}
   */
  async refreshToken(
    payload: RefreshTokenPayload,
    options?: JwtSignOptions,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      privateKey: this.jwtConfig.refresh.private,
      expiresIn: this.jwtConfig.refresh.expiresIn,
      algorithm: 'RS256',
      ...options,
    });
  }

  /**
   * @description Verify refresh token
   * @param {string} refreshToken
   * @param {JwtVerifyOptions} [options]
   * @returns {Promise<RefreshTokenPayload>}
   */
  async verifyRefreshToken(
    refreshToken: string,
    options?: JwtVerifyOptions,
  ): Promise<RefreshTokenPayload> {
    return this.jwtService
      .verifyAsync<RefreshTokenPayload>(refreshToken, {
        publicKey: this.jwtConfig.refresh.public,
        algorithms: ['RS256'],
        ...options,
      })
      .then(async (payload) => {
        return refreshTokenPayloadSchema.parseAsync(payload).catch(() => {
          throw new BadRequestException('Invalid refresh token');
        });
      });
  }

  /**
   * @description Generate email verification token
   * @param {EmailConfrimationTokenPayload} payload
   * @param {JwtSignOptions} [options]
   * @returns {Promise<string>}
   */
  async emailVerificationToken(
    payload: EmailConfrimationTokenPayload,
    options?: JwtSignOptions,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      privateKey: this.jwtConfig.emailVerification.private,
      expiresIn: this.jwtConfig.emailVerification.expiresIn,
      algorithm: 'RS256',
      ...options,
    });
  }

  /**
   * @description Verify email verification token
   * @param {string} verifyEmailToken
   * @param {JwtVerifyOptions} [options]
   * @returns {Promise<EmailConfrimationTokenPayload>}
   */
  async verifyEmailVerificationToken(
    verifyEmailToken: string,
    options?: JwtVerifyOptions,
  ): Promise<EmailConfrimationTokenPayload> {
    return this.jwtService
      .verifyAsync<EmailConfrimationTokenPayload>(verifyEmailToken, {
        publicKey: this.jwtConfig.emailVerification.public,
        algorithms: ['RS256'],
        ...options,
      })
      .then(async (payload) => {
        return emailConfrimationTokenPayloadSchema
          .parseAsync(payload)
          .catch(() => {
            throw new BadRequestException('Invalid email verification token');
          });
      });
  }
}
