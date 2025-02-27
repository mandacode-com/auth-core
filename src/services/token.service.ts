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
  private readonly publicKey: Config['jwt']['public'];
  private readonly privateKey: Config['jwt']['private'];
  private readonly tokenExpiresIn: Config['jwt']['expiresIn'];
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Config, true>,
  ) {
    this.publicKey = this.configService.get<Config['jwt']>('jwt').public;
    this.privateKey = this.configService.get<Config['jwt']>('jwt').private;
    this.tokenExpiresIn =
      this.configService.get<Config['jwt']>('jwt').expiresIn;
  }

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
      privateKey: this.privateKey.access,
      expiresIn: this.tokenExpiresIn.access,
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
        publicKey: this.publicKey.access,
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
      privateKey: this.privateKey.refresh,
      expiresIn: this.tokenExpiresIn.refresh,
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
        publicKey: this.publicKey.refresh,
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
   * @returns {Promise<string>}
   * @memberof TokenService
   */
  async emailVerificationToken(
    payload: EmailConfrimationTokenPayload,
    options?: JwtSignOptions,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      privateKey: this.privateKey.emailVerification,
      expiresIn: this.tokenExpiresIn.emailVerification,
      ...options,
    });
  }

  /**
   * @description Verify email verification token
   * @param {string} verifyEmailToken
   * @returns {Promise<EmailConfrimationTokenPayload>}
   */
  async verifyEmailVerificationToken(
    verifyEmailToken: string,
    options?: JwtVerifyOptions,
  ): Promise<EmailConfrimationTokenPayload> {
    return this.jwtService
      .verifyAsync<EmailConfrimationTokenPayload>(verifyEmailToken, {
        publicKey: this.publicKey.emailVerification,
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
