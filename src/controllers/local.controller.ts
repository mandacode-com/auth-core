import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { TypiaValidationPipe } from 'src/pipes/validation.pipe';
import { SigninService } from 'src/services/signin.service';
import { SignupService } from 'src/services/signup.service';
import { ISigninBody, ISignupBody } from 'src/types/auth';
import {
  validateSigninBody,
  validateSignupBody,
} from 'src/validations/auth.validate';

@Controller('local')
export class LocalController {
  constructor(
    private signinService: SigninService,
    private signupService: SignupService,
  ) {}

  @Post('signup')
  @HttpCode(201)
  async signup(
    @Req() req: Request,
    @Body(new TypiaValidationPipe(validateSignupBody)) body: ISignupBody,
  ) {
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
    const user = await this.signinService.signin(body.email, body.password);
    req.session.uuid = user.uuid_key;
    return 'Signin success';
  }
}
