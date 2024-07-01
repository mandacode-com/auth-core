import { Body, Controller, Post, Req } from '@nestjs/common';
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
  async signup(
    @Body(new TypiaValidationPipe(validateSignupBody)) body: ISignupBody,
  ) {
    await this.signupService.signup(body.email, body.password, body.nickname);
  }

  @Post('signin')
  async signin(
    @Body(new TypiaValidationPipe(validateSigninBody)) body: ISigninBody,
    @Req() req: Request,
  ) {
    const user = await this.signinService.signin(body.email, body.password);
    req.session.uuidKey = user.uuid_key;
  }
}
