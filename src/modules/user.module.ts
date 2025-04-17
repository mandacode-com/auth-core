import { Module } from '@nestjs/common';
import { TokenServiceModule } from './token_service.module';
import { PrismaModule } from './prisma.module';
import { UserController } from 'src/controllers/user.controller';
import { UserService } from 'src/services/user.service';
import { EventBusModule } from './event_bus.module';

@Module({
  imports: [TokenServiceModule, PrismaModule, EventBusModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
