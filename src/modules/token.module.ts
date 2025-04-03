import { Module } from '@nestjs/common';
import { TokenController } from 'src/controllers/token.controller';
import { TokenServiceModule } from './token_service.module';

@Module({
  imports: [TokenServiceModule],
  controllers: [TokenController],
})
export class TokenModule {}
