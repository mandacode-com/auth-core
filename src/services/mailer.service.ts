import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientGrpc } from '@nestjs/microservices';
import {
  MAILER_SERVICE_NAME,
  MailerServiceClient,
  MailType,
} from 'src/protos/mailer';
import { Config } from 'src/schemas/config.schema';

@Injectable()
export class MailerService implements OnModuleInit {
  private emailVerificationServiceClient: MailerServiceClient;
  private readonly localAuthConfig: Config['auth']['local'];
  constructor(
    @Inject(MAILER_SERVICE_NAME) private client: ClientGrpc,
    private readonly configService: ConfigService<Config, true>,
  ) {
    this.localAuthConfig = this.configService.get('auth', {
      infer: true,
    }).local;
  }

  onModuleInit() {
    this.emailVerificationServiceClient =
      this.client.getService<MailerServiceClient>(MAILER_SERVICE_NAME);
  }

  sendEmailVerificationToken(email: string, token: string) {
    const link = `${this.localAuthConfig.verifyEmailUrl}?token=${token}`;
    return this.emailVerificationServiceClient.sendEmail({
      type: MailType.VERIFY_EMAIL,
      to: email,
      subject: 'Verify your email address',
      verification: {
        link,
      },
    });
  }
}
