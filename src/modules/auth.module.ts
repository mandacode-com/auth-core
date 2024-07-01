import { Module } from '@nestjs/common';
import { SigninService } from 'src/services/signin.service';
import { SignupService } from 'src/services/signup.service';
import { LocalController } from 'src/controllers/local.controller';

@Module({
  controllers: [LocalController],
  providers: [SigninService, SignupService],
})
export class AuthModule {}
