import { Module } from '@nestjs/common';
import { SigninService } from 'src/services/signin.service';
import { SignupService } from 'src/services/signup.service';
import { LocalController } from 'src/controllers/local.controller';
import { PrismaService } from 'src/services/prisma.service';

@Module({
  controllers: [LocalController],
  providers: [SigninService, SignupService, PrismaService],
})
export class AuthModule {}
