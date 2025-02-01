import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AccessTokenPayload,
  EmailConfrimationTokenPayload,
  RefreshTokenPayload,
} from 'src/interfaces/token.interface';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * @description Generate access token
   * @param {AccessTokenPayload} payload
   * @returns {Promise<string>}
   * @memberof TokenService
   */
  async accessToken(payload: AccessTokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  /**
   * @description Verify access token
   * @param {string} accessToken
   * @returns {Promise<AccessTokenPayload>}
   * @memberof TokenService
   */
  async verifyAccessToken(accessToken: string): Promise<AccessTokenPayload> {
    return this.jwtService.verifyAsync<AccessTokenPayload>(accessToken);
  }

  /**
   * @description Generate refresh token
   * @param {RefreshTokenPayload} payload
   * @returns {Promise<string>}
   * @memberof TokenService
   */
  async refreshToken(payload: RefreshTokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  /**
   * @description Verify refresh token
   * @param {string} refreshToken
   * @returns {Promise<RefreshTokenPayload>}
   * @memberof TokenService
   */
  async verifyRefreshToken(refreshToken: string): Promise<RefreshTokenPayload> {
    return this.jwtService.verifyAsync(refreshToken);
  }

  /**
   * @description Generate email confirmation token
   * @param {EmailConfrimationTokenPayload} payload
   * @returns {Promise<string>}
   * @memberof TokenService
   */
  async emailConfirmToken(
    payload: EmailConfrimationTokenPayload,
  ): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  /**
   * @description Verify email confirmation token
   * @param {string} emailConfirmToken
   * @returns {Promise<EmailConfrimationTokenPayload>}
   * @memberof TokenService
   */
  async verifyEmailConfirmToken(
    emailConfirmToken: string,
  ): Promise<EmailConfrimationTokenPayload> {
    return this.jwtService.verifyAsync<EmailConfrimationTokenPayload>(
      emailConfirmToken,
    );
  }
}
