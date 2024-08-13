import { Module } from '@nestjs/common';
import { SigninService } from 'src/services/signin.service';
import { SignupService } from 'src/services/signup.service';
import { LocalController } from 'src/controllers/local.controller';
import { PrismaService } from 'src/services/prisma.service';
import { CodeService } from 'src/services/code.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SessionController } from 'src/controllers/session.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTO_MAILER',
        transport: Transport.TCP,
      },
    ]),
  ],
  controllers: [LocalController, SessionController],
  providers: [SigninService, SignupService, PrismaService, CodeService],
})
export class AuthModule {}
