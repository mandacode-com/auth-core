import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Provider, User } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class OauthAccountService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description Get a user
   * @param {{
   *   provider: Provider;
   *   providerId: string;
   *   }} data Provider and provider ID
   *   @returns {Promise<User>} User
   */
  async getUser(data: {
    provider: Provider;
    providerId: string;
  }): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        oauthAccounts: {
          some: {
            provider: data.provider,
            providerId: data.providerId,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * @description Create a user
   * @param {{
   *   provider: Provider;
   *   providerId: string;
   *   email: string;
   *   nickname?: string;
   *   }} data Provider, provider ID, email, and nickname
   *   @returns {Promise<User>} User
   */
  async createUser(data: {
    provider: Provider;
    providerId: string;
    email: string;
    nickname: string;
  }): Promise<User> {
    const randomUuid = randomUUID();
    const user = await this.prisma.user.create({
      data: {
        oauthAccounts: {
          create: {
            email: data.email,
            provider: data.provider,
            providerId: data.providerId,
          },
        },
        profile: {
          create: {
            nickname: data.nickname,
          },
        },
        uuid: randomUuid,
      },
    });

    return user;
  }
}
