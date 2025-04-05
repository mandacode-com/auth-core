import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { MAILER_PACKAGE_NAME, MAILER_SERVICE_NAME } from 'src/protos/mailer';
import { Config } from 'src/schemas/config.schema';
import { MailerService } from 'src/services/mailer.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MAILER_SERVICE_NAME,
        useFactory: (config: ConfigService<Config, true>) => {
          return {
            transport: Transport.GRPC,
            options: {
              package: MAILER_PACKAGE_NAME,
              protoPath: join(__dirname, '../protos/mailer.proto'),
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
