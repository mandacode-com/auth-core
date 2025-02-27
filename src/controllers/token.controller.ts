import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ResponseData } from 'src/interfaces/response.interface';
import { TokenService } from 'src/services/token.service';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request): Promise<
    ResponseData<{
      accessToken: string;
    }>
  > {
    const refreshToken = req.session.refresh;

    if (!refreshToken) {
      throw new NotFoundException('refresh token not found');
    }

    const payload = await this.tokenService.verifyRefreshToken(refreshToken);

    const [accessToken, newRefreshToken] = await Promise.all([
      this.tokenService.accessToken({
        uuid: payload.uuid,
        role: payload.role,
      }),
      this.tokenService.refreshToken({
        uuid: payload.uuid,
        role: payload.role,
      }),
    ]);

    req.session.refresh = newRefreshToken;

    return {
      message: 'success',
      data: {
        accessToken,
      },
    };
  }
}
