import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Provider, User, UserRole } from '@prisma/client';

@Injectable()
export class OauthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description Log in with OAuth
   * @param {{
   *   provider: Provider;
   *   providerId: string;
   *   }} data Provider and provider ID
   *   @returns {Promise<{
   *   uuid: string;
   *   role: UserRole;
   *   }>} UUID and role
   */
  async login(data: { provider: Provider; providerId: string }): Promise<{
    uuid: string;
    role: UserRole;
  }> {
    const user = await this.getUser(data);

    return {
      uuid: user.uuid,
      role: user.role,
    };
  }

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
   *   email?: string;
   *   nickname?: string;
   *   }} data Provider, provider ID, email, and nickname
   *   @returns {Promise<User>} User
   */
  async createUser(data: {
    provider: Provider;
    providerId: string;
    email?: string;
    nickname?: string;
  }): Promise<User> {
    const randomUuid = crypto.randomUUID();
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        oauthAccounts: {
          create: {
            provider: data.provider,
            providerId: data.providerId,
          },
        },
        uuid: randomUuid,
      },
    });

    return user;
  }
}
