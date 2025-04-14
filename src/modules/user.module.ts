import { Module } from '@nestjs/common';
import { TokenServiceModule } from './token_service.module';
import { PrismaModule } from './prisma.module';
import { UserController } from 'src/controllers/user.controller';
import { UserService } from 'src/services/user.service';

@Module({
  imports: [TokenServiceModule, PrismaModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
