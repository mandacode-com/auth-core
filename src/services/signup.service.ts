import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SignupService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new member
   * @param email Email address
   * @param password Password
   * @param nickname Nickname
   * @returns Created member
   */
  async signup(email: string, password: string, nickname?: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const modifiedNickname = nickname || email.split('@')[0];
    return await this.prisma.$transaction(async (tx) => {
      const member = await tx.member.create({
        data: {
          email,
        },
      });
      await tx.password.create({
        data: {
          member: { connect: { id: member.id } },
          password: hashedPassword,
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
          nickname: modifiedNickname,
        },
      });

      return member;
    });
  }
}
