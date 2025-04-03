import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { randomBytes, randomUUID } from 'crypto';
import { TokenService } from '../token.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { TempUser } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/schemas/config.schema';
import ms from 'ms';

@Injectable()
export class AuthLocalService {
  // Minimum delay between resending the email verification code in milliseconds
  private minDelay: number;
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService<Config, true>,
  ) {
    const config: Config['mailer'] = this.configService.get('mailer');
    this.minDelay = ms(config.minDelay as ms.StringValue);
  }

  /**
   * @description Create a temporary user
   * @param {{
   *    email: string;
   *    loginId: string;
   *    password: string;
   *    nickname?: string;
   *    }} data Email, login ID, password, nickname
   * @returns {Promise<string>} Email verification token
   */
  async createTempUser(data: {
    email: string;
    loginId: string;
    password: string;
    nickname?: string;
  }): Promise<string> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Check if the email or login ID already exists
    const [existingEmail, existingLoginId] = await Promise.all([
      this.prisma.authAccount.findUnique({
        select: {
          id: true,
        },
        where: {
          email: data.email,
        },
      }),
      this.prisma.authAccount.findUnique({
        select: {
          id: true,
        },
        where: {
          loginId: data.loginId,
        },
      }),
    ]);

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }
    if (existingLoginId) {
      throw new ConflictException('ID already exists');
    }

    const code = randomBytes(8).toString('hex');

    // Create a temporary user
    const tempUser = await this.prisma.tempUser
      .create({
        data: {
          email: data.email,
          loginId: data.loginId,
          password: hashedPassword,
          nickname: data.nickname ?? data.loginId,
          emailVerificationCode: code,
        },
      })
      .catch((e) => {
        if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
          throw new BadRequestException('Please verify the email');
        }
        throw e;
      });

    // Create a token
    const token = this.tokenService.emailVerificationToken({
      code: tempUser.emailVerificationCode,
      email: tempUser.email,
    });

    return token;
  }

  /**
   * @description Resend the email verification code
   * @param {{ email: string }} data Email
   * @returns {Promise<string>} Regenerated email verification token
   */
  async resend(data: { email: string }): Promise<string> {
    const tempUser = await this.prisma.tempUser.findUnique({
      select: {
        id: true,
        updateDate: true,
        resendCount: true,
      },
      where: {
        email: data.email,
      },
    });

    if (!tempUser) {
      throw new BadRequestException('user not found');
    }
    if (tempUser.updateDate.getTime() + this.minDelay > Date.now()) {
      throw new BadRequestException('Please wait 1 minute before resending');
    }
    if (tempUser.resendCount >= 10) {
      throw new BadRequestException('Please try again later');
    }

    const updatedTempUser = await this.prisma.tempUser.update({
      select: {
        emailVerificationCode: true,
      },
      data: {
        emailVerificationCode: randomBytes(8).toString('hex'),
      },
      where: {
        email: data.email,
      },
    });

    const token = this.tokenService.emailVerificationToken({
      code: updatedTempUser.emailVerificationCode,
      email: data.email,
    });

    return token;
  }

  /**
   * @description Verify the email
   * @param {{ token: string }} data Token
   * @returns {Promise<{ uuid: string }>} User UUID
   */
  async verifyEmail(data: { token: string }): Promise<{
    uuid: string;
  }> {
    const payload = await this.tokenService
      .verifyEmailVerificationToken(data.token)
      .catch(() => {
        throw new BadRequestException('Invalid token');
      });
    const tempUser = await this.prisma.tempUser.findUnique({
      where: {
        email: payload.email,
        emailVerificationCode: payload.code,
      },
    });

    if (!tempUser) {
      throw new BadRequestException('Temporary user not found');
    }

    const randomUuid = randomUUID();

    const [createdUser, _deleteTemporaryUser] = await this.prisma.$transaction([
      this.prisma.user.create({
        data: {
          uuid: randomUuid,
          profile: {
            create: {
              nickname: tempUser.nickname,
            },
          },
          authAccount: {
            create: {
              loginId: tempUser.loginId,
              password: tempUser.password,
              email: tempUser.email,
            },
          },
        },
      }),
      this.prisma.tempUser.delete({
        where: { id: tempUser.id },
      }),
    ]);

    return {
      uuid: createdUser.uuid,
    };
  }

  /**
   * @description Delete the temporary user
   * @param {{ email: string }} data Email
   * @returns {Promise<TempUser>}
   */
  async deleteTempUser(data: { email: string }): Promise<TempUser> {
    return this.prisma.tempUser.delete({
      where: {
        email: data.email,
      },
    });
  }

  /**
   * @description Login
   * @param {{ loginId: string; password: string }} data Login ID, password
   * @returns {Promise<{
   *   accessToken: string;
   *   refreshToken: string;
   *   }>
   */
  async login(data: { loginId: string; password: string }): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const authAccount = await this.prisma.authAccount.findUnique({
      select: {
        password: true,
        user: {
          select: {
            uuid: true,
            role: true,
          },
        },
      },
      where: {
        loginId: data.loginId,
      },
    });

    if (!authAccount) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    const passwordMatch = await bcrypt.compare(
      data.password,
      authAccount.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.accessToken({
        uuid: authAccount.user.uuid,
        role: authAccount.user.role,
      }),
      this.tokenService.refreshToken({
        uuid: authAccount.user.uuid,
        role: authAccount.user.role,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
