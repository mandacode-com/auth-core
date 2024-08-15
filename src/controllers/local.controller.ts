import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Inject,
  Post,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { PinoLogger } from 'nestjs-pino';
import { TypiaValidationPipe } from 'src/pipes/validation.pipe';
import { CodeService } from 'src/services/code.service';
import { SigninService } from 'src/services/signin.service';
import { SignupService } from 'src/services/signup.service';
import { ISigninBody, ISignupBody } from 'src/types/auth';
import { IConfig, ILinkUrl, IStatusConfig } from 'src/types/config';
import {
  validateSigninBody,
  validateSignupBody,
} from 'src/validations/auth.validate';

@Controller('local')
export class LocalController {
  constructor(
    private signinService: SigninService,
    private signupService: SignupService,
    private codeService: CodeService,
    private configService: ConfigService<IConfig, true>,
    private logger: PinoLogger,
    @Inject('AUTO_MAILER') private autoMailerClient: ClientProxy,
  ) {}

  onApplicationBootstrap() {
    this.autoMailerClient.connect();
  }

  @Get('confirm')
  @HttpCode(200)
  async confirm(@Query('token') token: string) {
    await this.signupService.confirm(token);
    return {
      message: 'success',
    };
  }

  @Get('resend')
  @HttpCode(200)
  async resend(@Query('email') email: string) {
    const confirmEmailLink =
      this.configService.get<ILinkUrl>('linkUrl').confirmEmail;
    const token = await this.signupService.resend(email);
    const link = `${confirmEmailLink}?token=${token}`;
    const obs = this.autoMailerClient.send(
      { cmd: 'confirm_email' },
      { email, link },
    );

    obs.subscribe({
      next: () => {
        this.logger.info(`Email sent to ${email}`);
      },
      error: (error) => {
        this.logger.error(`Failed to send email to ${email}`);
        this.logger.error(error);
      },
    });

    return {
      message: 'success',
    };
  }

  @Post('signup')
  @HttpCode(201)
  async signup(
    @Body(new TypiaValidationPipe(validateSignupBody)) body: ISignupBody,
  ) {
    if (this.configService.get<IStatusConfig>('status').localSignup === false) {
      throw new HttpException('Local signup is disabled', 423);
    }
    const confirmEmailLink =
      this.configService.get<ILinkUrl>('linkUrl').confirmEmail;
    const token = await this.signupService.signup(
      body.email,
      body.password,
      body.nickname,
    );
    const link = `${confirmEmailLink}?token=${token}`;
    const obs = this.autoMailerClient.send(
      { cmd: 'confirm_email' },
      { email: body.email, link },
    );

    obs.subscribe({
      next: () => {
        this.logger.info(`Email sent to ${body.email}`);
      },
      error: (error) => {
        this.logger.error(`Failed to send email to ${body.email}`);
        this.logger.error(error);
      },
    });

    return token;
  }

  @Post('signin')
  @HttpCode(200)
  async signin(
    @Body(new TypiaValidationPipe(validateSigninBody)) body: ISigninBody,
  ) {
    if (this.configService.get<IStatusConfig>('status').localSignin === false) {
      throw new HttpException('Local signin is disabled', 423);
    }
    const user = await this.signinService.signin(body.email, body.password);
    const code = await this.codeService.genCode(user.uuid_key);
    return {
      code,
    };
  }
}
