import { Module } from '@nestjs/common';
import { MobileAuthLocalController } from 'src/controllers/mobile/auth/local.controller';
import { MailerModule } from 'src/modules/mailer.module';
import { PrismaModule } from 'src/modules/prisma.module';
import { TokenServiceModule } from 'src/modules/token_service.module';
import { MobileAuthLocalService } from 'src/services/mobile/auth/local.service';

@Module({
  imports: [PrismaModule, MailerModule, TokenServiceModule],
  controllers: [MobileAuthLocalController],
  providers: [MobileAuthLocalService],
})
export class MobileAuthLocalModule {}
