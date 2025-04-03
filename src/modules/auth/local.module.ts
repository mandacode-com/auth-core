import { Module } from '@nestjs/common';
import { LocalController } from 'src/controllers/auth/local.controller';
import { AuthLocalService } from 'src/services/auth/local.service';
import { PrismaModule } from '../prisma.module';
import { MailerModule } from '../mailer.module';
import { TokenServiceModule } from '../token_service.module';

@Module({
  imports: [PrismaModule, MailerModule, TokenServiceModule],
  controllers: [LocalController],
  providers: [AuthLocalService],
})
export class AuthLocalModule {}
