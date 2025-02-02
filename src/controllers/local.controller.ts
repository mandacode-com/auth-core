import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  InternalServerErrorException,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { ResponseData } from 'src/interfaces/response.interface';
import { ZodValidationPipe } from 'src/pipes/validation.pipe';
import {
  SigninBody,
  signinBodySchema,
  SignupBody,
  signupBodySchema,
} from 'src/schemas/auth.schema';
import { Config } from 'src/schemas/config.schema';
import { AuthLocalService } from 'src/services/auth/local.service';
import { MailerService } from 'src/services/mailer.service';
import { TokenService } from 'src/services/token.service';

@Controller('local')
export class LocalController {
  private readonly localSignupStatus: boolean;
  private readonly localSigninStatus: boolean;
  private readonly confirmEmailUrl: string;

  constructor(
    private readonly authLocalService: AuthLocalService,
    private readonly configService: ConfigService<Config, true>,
    private readonly tokenService: TokenService,
    private readonly logger: PinoLogger,
    private readonly mailerService: MailerService,
  ) {
    this.localSignupStatus = this.configService.get('STATUS_LOCAL_SIGNUP');
    this.localSigninStatus = this.configService.get('STATUS_LOCAL_SIGNIN');
    this.confirmEmailUrl = this.configService.get('CONFIRM_EMAIL_URL');
  }

  @Get('confirm')
  @HttpCode(200)
  async confirm(@Query('token') token: string): Promise<ResponseData> {
    await this.authLocalService.confirm(token);
    return {
      message: 'success',
    };
  }

  @Get('resend')
  @HttpCode(200)
  async resend(@Query('email') email: string): Promise<ResponseData> {
    const token = await this.authLocalService.resend(email);
    return new Promise<ResponseData>((resolve, reject) => {
      this.mailerService.sendEmailVerificationToken(email, token).subscribe({
        next: () => {
          this.logger.info(`Email sent to ${email}`);
          resolve({
            message: 'email sent',
          });
        },
        error: (error) => {
          this.logger.error(
            `Failed to send email to ${email} with error: ${error}`,
          );
          reject(new InternalServerErrorException('Failed to send email'));
        },
      });
    });
  }

  @Post('signup')
  @HttpCode(201)
  async signup(
    @Body(new ZodValidationPipe(signupBodySchema)) body: SignupBody,
  ): Promise<ResponseData> {
    if (this.localSignupStatus === false) {
      throw new HttpException('Local signup is disabled', 423);
    }
    const token = await this.authLocalService.signup(
      body.email,
      body.password,
      body.nickname,
    );

    return new Promise<ResponseData>((resolve, reject) => {
      this.mailerService
        .sendEmailVerificationToken(body.email, token)
        .subscribe({
          next: () => {
            this.logger.info(`Email sent to ${body.email}`);
            resolve({
              message: 'success',
            });
          },
          error: (error) => {
            this.logger.error(
              `Failed to send email to ${body.email} with error: ${error}`,
            );
            reject(new InternalServerErrorException('Failed to send email'));
          },
        });
    });
  }

  @Post('signin')
  @HttpCode(200)
  async signin(
    @Body(new ZodValidationPipe(signinBodySchema))
    body: SigninBody,
    @Req() req: Request,
  ): Promise<
    ResponseData<{
      accessToken: string;
    }>
  > {
    if (this.localSigninStatus === false) {
      throw new HttpException('Local signin is disabled', 423);
    }
    const member = await this.authLocalService.signin(
      body.email,
      body.password,
    );

    // Issue access token and refresh token
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.accessToken({
        uuid: member.uuid,
      }),
      this.tokenService.refreshToken({
        uuid: member.uuid,
      }),
    ]);

    // Set refresh token in session
    req.session.refresh = refreshToken;

    return {
      message: 'success',
      data: {
        accessToken,
      },
    };
  }
}
