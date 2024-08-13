import { Module } from '@nestjs/common';
import { CodeService } from 'src/services/code.service';
import { SessionController } from 'src/controllers/session.controller';

@Module({
  controllers: [SessionController],
  providers: [CodeService],
})
export class SessionModule {}
