import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { randomBytes } from 'crypto';
import { PinoLogger } from 'nestjs-pino';
import { TokenService } from '../token.service';

@Injectable()
export class AuthLocalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly logger: PinoLogger,
  ) {}

  /**
   * @description Create a new member
   * @param {string} email Email address
   * @param {string} password Password
   * @param {string} [nickname] Nickname
   * @returns {Promise<string>}
   * @memberof SignupService
   * @throws {ConflictException} Email already exists
   * @throws {ConflictException} Please confirm the email
   */
  async signup(
    email: string,
    password: string,
    nickname?: string,
  ): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const modifiedNickname = nickname || email.split('@')[0];
    const { code } = await this.prisma.$transaction(async (tx) => {
      const existingMember = await tx.member.findUnique({
        where: { email },
      });
      if (existingMember) {
        throw new ConflictException('Email already exists');
      }
      const tempMember = await tx.temp_member.create({
        data: {
          code: randomBytes(8).toString('hex'),
        },
      });
      await tx.temp_member_info
        .create({
          data: {
            temp_member: { connect: { id: tempMember.id } },
            email,
            password: hashedPassword,
            nickname: modifiedNickname,
          },
        })
        .catch((e) => {
          if (e.code === 'P2002') {
            throw new ConflictException('Please confirm the email');
          }
          throw e;
        });

      return { email, code: tempMember.code };
    });

    const token = this.tokenService.emailConfirmToken({
      email,
      code,
    });

    return token;
  }

  /**
   * @description Resend the confirmation email
   * @param {string} email Email address
   * @returns {Promise<string>}
   * @memberof SignupService
   * @throws {BadRequestException} Member not found
   * @throws {InternalServerErrorException} Temp member not found
   */
  async resend(email: string): Promise<string> {
    const tempMemberInfo = await this.prisma.temp_member_info.findUnique({
      where: { email },
    });
    if (!tempMemberInfo) {
      throw new BadRequestException('Member not found');
    }
    const tempMember = await this.prisma.temp_member.findUnique({
      where: { id: tempMemberInfo.temp_member_id },
    });
    if (!tempMember) {
      throw new InternalServerErrorException('Temp member not found');
    }

    const newCode = await this.prisma.$transaction(async (tx) => {
      await tx.temp_member.update({
        where: { id: tempMember.id },
        data: {
          code: randomBytes(8).toString('hex'),
        },
      });
      return tempMember.code;
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
    return await this.prisma.$transaction(async (tx) => {
      const tempMemberInfo = await tx.temp_member_info.findUnique({
        where: { email: data.email },
      });
      if (!tempMemberInfo) {
        throw new BadRequestException('Member not found');
      }
      const tempMember = await tx.temp_member.findUnique({
        where: { id: tempMemberInfo.temp_member_id },
      });
      if (!tempMember) {
        throw new InternalServerErrorException('Temp member not found');
      }
      if (tempMember.code !== data.code) {
        throw new BadRequestException(`Code does not match`);
      }

      // Create a new member
      const member = await tx.member.create({
        data: {
          email: tempMemberInfo.email,
        },
      });
      await tx.password.create({
        data: {
          member: { connect: { id: member.id } },
          password: tempMemberInfo.password,
        },
      });
      await tx.provider.create({
        data: {
          member: { connect: { id: member.id } },
          provider: 'local',
        },
      });
      await tx.profile.create({
        data: {
          member: { connect: { id: member.id } },
          nickname: tempMemberInfo.nickname,
        },
      });

      // Delete temporary member and temporary member info
      await tx.temp_member_info.delete({
        where: { id: tempMemberInfo.id },
      });
      await tx.temp_member.delete({
        where: { id: tempMember.id },
      });
      return {
        uuid: member.uuid_key,
        email: member.email,
      };
    });
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
      where: {
        email,
      },
    });
    if (!member) {
      this.logger.error('email does not exist.');
      throw new UnauthorizedException('Email or password is incorrect.');
    }

    const provider = await this.prisma.provider.findUnique({
      where: {
        user_id: member.id,
      },
    });
    if (!provider) {
      this.logger.error('provider does not exist.');
      throw new InternalServerErrorException('Provider does not exist.');
    }

    const savedPassword = await this.prisma.password.findUnique({
      where: {
        user_id: member.id,
      },
    });
    if (!savedPassword) {
      this.logger.error('password does not exist.');
      throw new InternalServerErrorException('Password does not exist.');
    }

    const comparePassword = await bcrypt.compare(
      password,
      savedPassword.password,
    );
    if (!comparePassword) {
      this.logger.error('password is incorrect.');
      throw new UnauthorizedException('Email or password is incorrect.');
    }

    return {
      uuid: member.uuid_key,
      email: member.email,
    };
  }
}
