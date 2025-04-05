import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ResponseData } from 'src/interfaces/response.interface';
import { AccessTokenPayload } from 'src/schemas/token.schema';
import { TokenService } from 'src/services/token.service';

@Controller('m/token')
export class MobileTokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('verify')
  @HttpCode(200)
  async verify(@Req() req: Request): Promise<ResponseData<AccessTokenPayload>> {
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
      throw new NotFoundException('access token not found');
    }

    const payload = await this.tokenService.verifyAccessToken(accessToken);

    return {
      message: 'success',
      data: payload,
    };
  }

  @Get('refresh')
  @HttpCode(200)
  async refresh(@Body() body: { refreshToken: string }): Promise<
    ResponseData<{
      accessToken: string;
      refreshToken: string;
    }>
  > {
    const refreshToken = body.refreshToken;

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

    return {
      message: 'success',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    };
  }
}
