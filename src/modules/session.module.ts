import { Module } from '@nestjs/common';
import { SessionController } from 'src/controllers/session.controller';

@Module({
  controllers: [SessionController],
})
export class SessionModule {}
