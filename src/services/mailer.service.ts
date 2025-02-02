import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientGrpc } from '@nestjs/microservices';
import {
  EMAIL_VERIFICATION_SERVICE_NAME,
  EmailVerificationServiceClient,
} from 'src/protos/email_verification';

@Injectable()
export class MailerService implements OnModuleInit {
  private emailVerificationServiceClient: EmailVerificationServiceClient;
  constructor(
    @Inject('AUTO_MAILER') private client: ClientGrpc,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.emailVerificationServiceClient =
      this.client.getService<EmailVerificationServiceClient>(
        EMAIL_VERIFICATION_SERVICE_NAME,
      );
  }

  sendEmailVerificationToken(email: string, token: string) {
    const link = `${this.configService.get('CONFIRM_EMAIL_URL')}?token=${token}`;
    return this.emailVerificationServiceClient.sendEmailVerificationLink({
      email,
      link,
    });
  }
}
