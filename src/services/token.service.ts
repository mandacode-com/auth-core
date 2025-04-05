import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  AccessTokenPayload,
  accessTokenPayloadSchema,
  EmailConfrimationTokenPayload,
  emailConfrimationTokenPayloadSchema,
  RefreshTokenPayload,
  refreshTokenPayloadSchema,
} from 'src/schemas/token.schema';
import {
  TOKEN_SERVICE_NAME,
  TokenServiceClient,
  TokenType,
} from 'src/protos/token';
import { ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class TokenService {
  private tokenClient: TokenServiceClient;
  constructor(@Inject(TOKEN_SERVICE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.tokenClient =
      this.client.getService<TokenServiceClient>(TOKEN_SERVICE_NAME);
  }

  /**
   * @description Generate access token
   * @param {AccessTokenPayload} payload
   * @returns {Promise<string>}
   */
  async accessToken(payload: AccessTokenPayload): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.tokenClient
        .issueToken({
          type: TokenType.ACCESS,
          accessTokenPayload: {
            uuid: payload.uuid,
            role: payload.role,
          },
        })
        .subscribe({
          next: (response) => {
            resolve(response.token);
          },
          error: () => {
            reject(new BadRequestException('Failed to generate access token'));
          },
        });
    });
  }

  /**
   * @description Verify access token
   * @param {string} accessToken
   * @returns {Promise<AccessTokenPayload>}
   */
  async verifyAccessToken(accessToken: string): Promise<AccessTokenPayload> {
    return new Promise<AccessTokenPayload>((resolve, reject) => {
      this.tokenClient
        .verifyToken({
          type: TokenType.ACCESS,
          token: accessToken,
        })
        .subscribe({
          next: (response) => {
            accessTokenPayloadSchema
              .parseAsync({
                uuid: response.accessTokenPayload?.uuid,
                role: response.accessTokenPayload?.role,
              })
              .then((payload) => {
                resolve(payload);
              })
              .catch(() => {
                reject(new BadRequestException('Invalid access token'));
              });
          },
          error: () => {
            reject(new BadRequestException('Invalid access token'));
          },
        });
    });
  }

  /**
   * @description Generate refresh token
   * @param {RefreshTokenPayload} payload
   * @returns {Promise<string>}
   */
  async refreshToken(payload: RefreshTokenPayload): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.tokenClient
        .issueToken({
          type: TokenType.REFRESH,
          refreshTokenPayload: {
            uuid: payload.uuid,
            role: payload.role,
          },
        })
        .subscribe({
          next: (response) => {
            resolve(response.token);
          },
          error: () => {
            reject(new BadRequestException('Failed to generate refresh token'));
          },
        });
    });
  }

  /**
   * @description Verify refresh token
   * @param {string} refreshToken
   * @returns {Promise<RefreshTokenPayload>}
   */
  async verifyRefreshToken(refreshToken: string): Promise<RefreshTokenPayload> {
    return new Promise<RefreshTokenPayload>((resolve, reject) => {
      this.tokenClient
        .verifyToken({
          type: TokenType.REFRESH,
          token: refreshToken,
        })
        .subscribe({
          next: (response) => {
            refreshTokenPayloadSchema
              .parseAsync({
                uuid: response.refreshTokenPayload?.uuid,
                role: response.refreshTokenPayload?.role,
              })
              .then((payload) => {
                resolve(payload);
              })
              .catch(() => {
                reject(new BadRequestException('Invalid refresh token'));
              });
          },
          error: () => {
            reject(new BadRequestException('Invalid refresh token'));
          },
        });
    });
  }

  /**
   * @description Generate email verification token
   * @param {EmailConfrimationTokenPayload} payload
   * @returns {Promise<string>}
   */
  async emailVerificationToken(
    payload: EmailConfrimationTokenPayload,
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.tokenClient
        .issueToken({
          type: TokenType.EMAIL_VERIFICATION,
          emailVerificationTokenPayload: {
            email: payload.email,
            code: payload.code,
          },
        })
        .subscribe({
          next: (response) => {
            resolve(response.token);
          },
          error: () => {
            reject(
              new BadRequestException(
                'Failed to generate email verification token',
              ),
            );
          },
        });
    });
  }

  /**
   * @description Verify email verification token
   * @param {string} verifyEmailToken
   * @returns {Promise<EmailConfrimationTokenPayload>}
   */
  async verifyEmailVerificationToken(
    verifyEmailToken: string,
  ): Promise<EmailConfrimationTokenPayload> {
    return new Promise<EmailConfrimationTokenPayload>((resolve, reject) => {
      this.tokenClient
        .verifyToken({
          type: TokenType.EMAIL_VERIFICATION,
          token: verifyEmailToken,
        })
        .subscribe({
          next: (response) => {
            emailConfrimationTokenPayloadSchema
              .parseAsync({
                email: response.emailVerificationTokenPayload?.email,
                code: response.emailVerificationTokenPayload?.code,
              })
              .then((payload) => {
                resolve(payload);
              })
              .catch(() => {
                reject(
                  new BadRequestException('Invalid email verification token'),
                );
              });
          },
          error: () => {
            reject(new BadRequestException('Invalid email verification token'));
          },
        });
    });
  }
}
