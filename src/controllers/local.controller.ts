import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Post,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypiaValidationPipe } from 'src/pipes/validation.pipe';
import { CodeService } from 'src/services/code.service';
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
    private codeService: CodeService,
    private configService: ConfigService<IConfig, true>,
  ) {}

  @Get('confirm')
  @HttpCode(200)
  async confirm(@Query('token') token: string) {
    await this.signupService.confirm(token);
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
    const token = await this.signupService.signup(
      body.email,
      body.password,
      body.nickname,
    );
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
