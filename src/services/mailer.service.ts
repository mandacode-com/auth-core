import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientGrpc } from '@nestjs/microservices';
import {
  EMAIL_VERIFICATION_SERVICE_NAME,
  EmailVerificationServiceClient,
} from 'src/protos/email_verification';
import { Config } from 'src/schemas/config.schema';

@Injectable()
export class MailerService implements OnModuleInit {
  private emailVerificationServiceClient: EmailVerificationServiceClient;
  private readonly urls: Config['urls'];
  constructor(
    @Inject('AUTO_MAILER') private client: ClientGrpc,
    private readonly configService: ConfigService<Config, true>,
  ) {
    this.urls = this.configService.get('urls');
  }

  onModuleInit() {
    this.emailVerificationServiceClient =
      this.client.getService<EmailVerificationServiceClient>(
        EMAIL_VERIFICATION_SERVICE_NAME,
      );
  }

  sendEmailVerificationToken(email: string, token: string) {
    const link = `${this.urls.verifyEmail}?token=${token}`;
    return this.emailVerificationServiceClient.sendEmailVerificationLink({
      email,
      link,
    });
  }
}
