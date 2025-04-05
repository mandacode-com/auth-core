import { Module } from '@nestjs/common';
import { TokenServiceModule } from '../token_service.module';
import { MobileTokenController } from 'src/controllers/mobile/token.controller';

@Module({
  imports: [TokenServiceModule],
  controllers: [MobileTokenController],
})
export class MobileTokenModule {}
