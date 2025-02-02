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
import { provider_type } from '@prisma/client';

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
    const tempMember = await this.prisma.temp_member
      .create({
        data: {
          code: randomBytes(8).toString('hex'),
          temp_member_info: {
            create: {
              email,
              password: hashedPassword,
              nickname: modifiedNickname,
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
      code: tempMember.code,
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
    const tempMember = await this.prisma.temp_member_info.findUnique({
      select: {
        temp_member: {
          select: {
            id: true,
            code: true,
          },
        },
      },
      where: { email },
    });
    if (!tempMember) {
      throw new BadRequestException('Member not found');
    }

    const newCode = await this.prisma.$transaction(async (tx) => {
      await tx.temp_member.update({
        where: { id: tempMember.temp_member.id },
        data: {
          code: randomBytes(8).toString('hex'),
        },
      });
      return tempMember.temp_member.code;
    });

    const token = this.tokenService.emailConfirmToken({
      email,
      code: newCode,
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
   * @throws {InternalServerErrorException} Temp member not found
   * @throws {BadRequestException} Code does not match
   */
  async confirm(token: string): Promise<{
    uuid: string;
    email: string;
  }> {
    const data = await this.tokenService.verifyEmailConfirmToken(token);
    const tempMember = await this.prisma.temp_member_info.findUniqueOrThrow({
      select: {
        email: true,
        nickname: true,
        password: true,
        temp_member: {
          select: {
            id: true,
            code: true,
          },
        },
      },
      where: { email: data.email },
    });
    if (tempMember.temp_member.code !== data.code) {
      throw new BadRequestException(`Code does not match`);
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
                provider: 'local',
              },
            },
            profile: {
              create: {
                nickname: tempMember.nickname,
              },
            },
          },
        }),
        this.prisma.temp_member.delete({
          where: { id: tempMember.temp_member.id },
        }),
      ]);

    return {
      uuid: createdMember.uuid_key,
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
    const member = await this.prisma.member
      .findUniqueOrThrow({
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
          uuid_key: true,
          email: true,
        },
        where: {
          email,
        },
      })
      .catch(() => {
        throw new UnauthorizedException('Email or password is incorrect.');
      });

    if (member.provider?.provider !== provider_type.local) {
      throw new BadRequestException('This method is not allowed. Use OAuth2.');
    }
    const comparePasswordResult = await bcrypt.compare(
      password,
      member.password?.password || '',
    );
    if (!comparePasswordResult) {
      throw new UnauthorizedException('Email or password is incorrect.');
    }

    return {
      uuid: member.uuid_key,
      email: member.email,
    };
  }
}
