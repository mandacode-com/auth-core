import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { randomBytes } from 'crypto';
import { TokenService } from '../token.service';
import { GradeType, ProviderType } from '@prisma/client';

@Injectable()
export class AuthLocalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * @description Create a new member
   * @param {string} email Email address
   * @param {string} password Password
   * @param {string} [nickname] Nickname
   * @returns {Promise<string>}
   * @memberof SignupService
   * @throws {ConflictException} Email already exists
   * @throws {BadRequestException} Please confirm the email
   */
  async signup(
    email: string,
    password: string,
    nickname?: string,
  ): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const modifiedNickname = nickname || email.split('@')[0];

    const existingMember = await this.prisma.member.findUnique({
      where: { email },
    });
    if (existingMember) {
      throw new ConflictException('Email already exists');
    }
    const tempMember = await this.prisma.tempMember
      .create({
        select: {
          emailVerification: {
            select: {
              code: true,
            },
          },
        },
        data: {
          email,
          nickname: modifiedNickname,
          password: hashedPassword,
          emailVerification: {
            create: {
              code: randomBytes(8).toString('hex'),
            },
          },
        },
      })
      .catch((e) => {
        if (e.code === 'P2002') {
          throw new BadRequestException('Please confirm the email');
        }
        throw e;
      });

    const token = this.tokenService.emailConfirmToken({
      email,
      code: tempMember.emailVerification.code,
    });

    return token;
  }

  /**
   * @description Resend the confirmation email
   * @param {string} email Email address
   * @returns {Promise<string>}
   * @memberof SignupService
   * @throws {BadRequestException} Member not found
   */
  async resend(email: string): Promise<string> {
    const updatedTempMember = await this.prisma.tempMember.update({
      select: {
        email: true,
        emailVerification: {
          select: {
            code: true,
          },
        },
      },
      where: {
        email,
      },
      data: {
        emailVerification: {
          update: {
            code: randomBytes(8).toString('hex'),
          },
        },
      },
    });

    const token = this.tokenService.emailConfirmToken({
      email,
      code: updatedTempMember.emailVerification.code,
    });
    return token;
  }

  /**
   * @description Confirm the email
   * @param {string} token Token
   * @returns {Promise<{ uuid: string; email: string }>}
   * @memberof SignupService
   * @throws {BadRequestException} Invalid token
   * @throws {BadRequestException} Member not found
   * @throws {BadRequestException} Code does not match
   */
  async confirm(token: string): Promise<{
    uuid: string;
    email: string;
  }> {
    const data = await this.tokenService
      .verifyEmailConfirmToken(token)
      .catch(() => {
        throw new BadRequestException('Invalid token');
      });
    const tempMember = await this.prisma.tempMember.findUnique({
      select: {
        id: true,
        email: true,
        password: true,
        nickname: true,
        emailVerification: {
          select: {
            code: true,
          },
        },
      },
      where: {
        email: data.email,
      },
    });

    if (!tempMember) {
      throw new BadRequestException('Member not found');
    }

    if (tempMember.emailVerification.code !== data.code) {
      throw new BadRequestException('Code does not match');
    }

    const [createdMember, _deleteTemporaryMember] =
      await this.prisma.$transaction([
        this.prisma.member.create({
          data: {
            email: tempMember.email,
            password: {
              create: {
                password: tempMember.password,
              },
            },
            provider: {
              create: {
                provider: ProviderType.LOCAL,
              },
            },
            profile: {
              create: {
                nickname: tempMember.nickname,
              },
            },
            memberGrade: {
              create: {
                grade: GradeType.NORMAL,
              },
            },
          },
        }),
        this.prisma.tempMember.delete({
          where: { id: tempMember.id },
        }),
      ]);

    return {
      uuid: createdMember.uuidKey,
      email: createdMember.email,
    };
  }

  /**
   * @description Sign in
   * @param {string} email Email address
   * @param {string} password Password
   * @returns {Promise<member>}
   * @memberof SigninService
   * @throws {UnauthorizedException} Email or password is incorrect
   * @throws {InternalServerErrorException} Provider does not exist
   * @throws {InternalServerErrorException} Password does not exist
   */
  async signin(
    email: string,
    password: string,
  ): Promise<{
    uuid: string;
    email: string;
  }> {
    const member = await this.prisma.member.findUnique({
      select: {
        provider: {
          select: {
            provider: true,
          },
        },
        password: {
          select: {
            password: true,
          },
        },
        uuidKey: true,
        email: true,
      },
      where: {
        email,
      },
    });

    // Check if the member exists
    if (!member) {
      throw new UnauthorizedException('Email or password is incorrect.');
    }

    // Check if the provider is local
    if (member.provider?.provider !== ProviderType.LOCAL) {
      throw new BadRequestException('This method is not allowed. Use OAuth2.');
    }

    // Check if the password correct
    const comparePasswordResult = await bcrypt.compare(
      password,
      member.password?.password || '',
    );
    if (!comparePasswordResult) {
      throw new UnauthorizedException('Email or password is incorrect.');
    }

    return {
      uuid: member.uuidKey,
      email: member.email,
    };
  }
}
