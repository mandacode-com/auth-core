import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import {
  EMAIL_VERIFICATION_PACKAGE_NAME,
  EMAIL_VERIFICATION_SERVICE_NAME,
} from 'src/protos/email_verification';
import { Config } from 'src/schemas/config.schema';
import { MailerService } from 'src/services/mailer.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: EMAIL_VERIFICATION_SERVICE_NAME,
        useFactory: (config: ConfigService<Config, true>) => {
          return {
            transport: Transport.GRPC,
            options: {
              package: EMAIL_VERIFICATION_PACKAGE_NAME,
              protoPath: join(__dirname, '../protos/email_verification.proto'),
              url: config.get('mailerService', { infer: true }).url,
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
