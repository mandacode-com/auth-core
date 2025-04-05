import { Module } from '@nestjs/common';
import { AuthLocalController } from 'src/controllers/web/auth/local.controller';
import { AuthLocalService } from 'src/services/web/auth/local.service';
import { PrismaModule } from '../../prisma.module';
import { MailerModule } from '../../mailer.module';
import { TokenServiceModule } from '../../token_service.module';

@Module({
  imports: [PrismaModule, MailerModule, TokenServiceModule],
  controllers: [AuthLocalController],
  providers: [AuthLocalService],
})
export class AuthLocalModule {}
