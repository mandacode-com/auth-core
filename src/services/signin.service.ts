import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { member } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './prisma.service';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class SigninService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: PinoLogger,
  ) {}

  async signin(email: string, password: string): Promise<member> {
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

    return member;
  }
}
