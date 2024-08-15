import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './prisma.service';
import { JwtService } from '@nestjs/jwt';
import { IToken } from 'src/types/auth';
import { randomBytes } from 'crypto';

@Injectable()
export class SignupService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Create a new member
   * @param email Email address
   * @param password Password
   * @param nickname Nickname
   * @returns Confirmation token
   */
  async signup(email: string, password: string, nickname?: string) {
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

    const tokenData: IToken = {
      email,
      code,
    };
    const token = this.jwtService.sign(tokenData);

    return token;
  }

  async resend(email: string) {
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

    return this.jwtService.sign({ email, code: newCode });
  }

  /**
   * Verify the confirmation token
   * @param token Confirmation token
   */
  async confirm(token: string) {
    const { email, code } = this.jwtService.verify<IToken>(token);
    return await this.prisma.$transaction(async (tx) => {
      const tempMemberInfo = await tx.temp_member_info.findUnique({
        where: { email },
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
      if (tempMember.code !== code) {
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
      return member;
    });
  }
}
