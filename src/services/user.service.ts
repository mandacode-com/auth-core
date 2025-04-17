import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { KafkaService } from './kafka.service';
import { USER_DELETE_TOPIC } from 'src/config/constants';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: KafkaService,
  ) {}

  async deleteUser(uuid: string): Promise<User> {
    const user = await this.prisma.user
      .delete({
        where: { uuid },
      })
      .catch((error) => {
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === 'P2025'
        ) {
          throw new NotFoundException('User not found');
        }
        throw error;
      });

    // Emit user deletion event to Kafka
    await this.eventBus.emit(USER_DELETE_TOPIC, {
      uuid: uuid,
    });

    return user;
  }
}
