import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './prisma.service';

@Injectable()
export class SignupService {
  constructor(private prisma: PrismaService) {}

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
      const member = await tx.member
        .create({
          data: {
            email,
          },
        })
        .catch((e) => {
          if (e.code === 'P2002') {
            throw new ConflictException('Email already exists');
          }
          throw e;
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
