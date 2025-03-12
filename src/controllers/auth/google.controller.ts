import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { OauthService } from 'src/services/oauth/oauth.service';

@Controller('auth/oauth/google')
export class GoogleController {
  constructor(private readonly oauthService: OauthService) {}

  @Get('callback')
  async callback(@Query('code') code: string, @Res() res: Response) {}
}
