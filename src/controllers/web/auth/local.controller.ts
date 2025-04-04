import {
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ResponseData } from 'src/interfaces/response.interface';
import { ZodValidationPipe } from 'src/pipes/validation.pipe';
import {
  LoginBody,
  loginBodySchema,
  SignupBody,
  signupBodySchema,
} from 'src/schemas/auth.schema';
import { AuthLocalService } from 'src/services/web/auth/local.service';
import { MailerService } from 'src/services/mailer.service';

@Controller('auth/local')
export class AuthLocalController {
  constructor(
    private readonly authLocalService: AuthLocalService,
    private readonly mailerService: MailerService,
  ) {}

  @Get('verify-email')
  @HttpCode(200)
  async verify(@Query('token') token: string): Promise<ResponseData> {
    await this.authLocalService.verifyEmail({ token });
    return {
      message: 'success',
    };
  }

  @Get('resend')
  @HttpCode(200)
  async resend(@Query('email') email: string): Promise<ResponseData> {
    const token = await this.authLocalService.resend({ email });
    return new Promise<ResponseData>((resolve, reject) => {
      this.mailerService.sendEmailVerificationToken(email, token).subscribe({
        next: () => {
          resolve({
            message: 'email sent',
          });
        },
        error: (_error) => {
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
    const token = await this.authLocalService.createTempUser({
      email: body.email,
      loginId: body.loginId,
      password: body.password,
      nickname: body.nickname,
    });

    return new Promise<ResponseData>((resolve, reject) => {
      this.mailerService
        .sendEmailVerificationToken(body.email, token)
        .subscribe({
          next: () => {
            resolve({
              message: 'success',
            });
          },
          error: (_error) => {
            this.authLocalService
              .deleteTempUser({ email: body.email })
              .then(() => {
                reject(
                  new InternalServerErrorException('Failed to send email'),
                );
              })
              .catch((_err) => {
                reject(
                  new InternalServerErrorException(
                    'Failed to send email and delete temporary user',
                  ),
                );
              });
          },
        });
    });
  }

  @Post('login')
  @HttpCode(200)
  async signin(
    @Body(new ZodValidationPipe(loginBodySchema))
    body: LoginBody,
    @Req() req: Request,
  ): Promise<
    ResponseData<{
      accessToken: string;
    }>
  > {
    const { accessToken, refreshToken } = await this.authLocalService.login({
      loginId: body.loginId,
      password: body.password,
    });

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
