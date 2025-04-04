import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/modules/prisma.module';
import { OauthAccountService } from 'src/services/oauth_account.service';

@Module({
  imports: [PrismaModule],
  providers: [OauthAccountService],
  exports: [OauthAccountService],
})
export class OauthAccountModule {}
