import { Module } from '@nestjs/common';
import { TokenController } from 'src/controllers/token.controller';
import { TokenModule } from './token.module';

@Module({
  imports: [TokenModule],
  controllers: [TokenController],
})
export class TokenControllerModule {}
