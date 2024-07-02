import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  Post,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { TypiaValidationPipe } from 'src/pipes/validation.pipe';
import { SigninService } from 'src/services/signin.service';
import { SignupService } from 'src/services/signup.service';
import { ISigninBody, ISignupBody } from 'src/types/auth';
import { IConfig, IStatusConfig } from 'src/types/config';
import {
  validateSigninBody,
  validateSignupBody,
} from 'src/validations/auth.validate';

@Controller('local')
export class LocalController {
  constructor(
    private signinService: SigninService,
    private signupService: SignupService,
    private configService: ConfigService<IConfig, true>,
  ) {}

  @Post('signup')
  @HttpCode(201)
  async signup(
    @Req() req: Request,
    @Body(new TypiaValidationPipe(validateSignupBody)) body: ISignupBody,
  ) {
    if (this.configService.get<IStatusConfig>('status').localSignup === false) {
      throw new HttpException('Local signup is disabled', 423);
    }
    const user = await this.signupService.signup(
      body.email,
      body.password,
      body.nickname,
    );
    req.session.uuid = user.uuid_key;
    return 'Signup success';
  }

  @Post('signin')
  @HttpCode(200)
  async signin(
    @Req() req: Request,
    @Body(new TypiaValidationPipe(validateSigninBody)) body: ISigninBody,
  ) {
    if (this.configService.get<IStatusConfig>('status').localSignin === false) {
      throw new HttpException('Local signin is disabled', 423);
    }
    const user = await this.signinService.signin(body.email, body.password);
    req.session.uuid = user.uuid_key;
    return 'Signin success';
  }
}
