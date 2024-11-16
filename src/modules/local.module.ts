import { Module } from '@nestjs/common';
import { SigninService } from 'src/services/signin.service';
import { SignupService } from 'src/services/signup.service';
import { LocalController } from 'src/controllers/local.controller';
import { PrismaService } from 'src/services/prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { CodeService } from 'src/services/code.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTO_MAILER',
        transport: Transport.TCP,
        options: {
          host: process.env.AUTO_MAILER_HOST,
          port: parseInt(process.env.AUTO_MAILER_PORT!),
        },
      },
    ]),
    JwtModule.register({
      signOptions: { expiresIn: '1d' },
      secret: process.env.JWT_SECRET,
      global: true,
    }),
  ],
  controllers: [LocalController],
  providers: [SigninService, SignupService, PrismaService, CodeService],
})
export class LocalModule {}
