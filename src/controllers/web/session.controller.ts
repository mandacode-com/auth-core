import {
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ResponseData } from 'src/interfaces/response.interface';

@Controller('session')
export class SessionController {
  constructor() {}

  @Get('check')
  @HttpCode(200)
  getAccess(@Req() req: Request): ResponseData {
    if (req.session.refresh) {
      return {
        message: 'session is valid',
      };
    }
    throw new NotFoundException('session not found');
  }

  @Get('destroy')
  @HttpCode(200)
  logout(@Req() req: Request): ResponseData {
    req.session.destroy((err) => {
      if (err) {
        throw new InternalServerErrorException('Failed to destroy session');
      }
    });
    return {
      message: 'session destroyed',
    };
  }
}
