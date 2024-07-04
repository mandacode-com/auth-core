import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Query,
  Req,
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
}
