import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/modules/prisma.module';
import { OauthService } from 'src/services/oauth/oauth.service';

@Module({
  imports: [PrismaModule],
  providers: [OauthService],
  exports: [OauthService],
})
export class OauthModule {}
