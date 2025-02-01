import { Controller, Get, HttpCode, Req } from '@nestjs/common';
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
      return {
        message: 'refresh token not found',
      };
    }

    // if refresh token is expired, it will refresh the token
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const accessToken = await this.tokenService.accessToken({
      uuid: payload.uuid,
    });

    return {
      message: 'success',
      data: {
        accessToken,
      },
    };
  }
}
