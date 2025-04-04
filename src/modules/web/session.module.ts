import { Module } from '@nestjs/common';
import { SessionController } from 'src/controllers/web/session.controller';

@Module({
  controllers: [SessionController],
})
export class SessionModule {}
