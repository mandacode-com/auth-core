import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { EMAIL_VERIFICATION_PACKAGE_NAME } from 'src/protos/email_verification';
import { MailerService } from 'src/services/mailer.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTO_MAILER',
        transport: Transport.GRPC,
        options: {
          package: EMAIL_VERIFICATION_PACKAGE_NAME,
          protoPath: join(__dirname, '../protos/email_verification.proto'),
          url: process.env.AUTO_MAILER_URL,
        },
      },
    ]),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
