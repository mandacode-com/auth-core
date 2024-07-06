import {
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { CodeService } from 'src/services/code.service';

@Controller('session')
export class SessionController {
  constructor(private readonly codeService: CodeService) {}

  @Get('issue')
  @HttpCode(200)
  async getUuid(@Query('code') code: string, @Req() req: Request) {
    const uuid = await this.codeService.getUuid(code);
    if (!uuid) {
      throw new NotFoundException('Code not found');
    }
    req.session.uuid = uuid;
    return 'success';
  }

  @Get('destroy')
  @HttpCode(200)
  async logout(@Req() req: Request) {
    req.session.destroy((err) => {
      if (err) {
        throw new InternalServerErrorException('Failed to logout');
      }
    });
    return 'success';
  }

  @Get('check')
  @HttpCode(200)
  async check(@Req() req: Request) {
    if (req.session.uuid) {
      return 'valid';
    }
    throw new UnauthorizedException('Invalid session');
  }
}
