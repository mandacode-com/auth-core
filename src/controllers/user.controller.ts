import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ResponseData } from 'src/interfaces/response.interface';
import { TokenService } from 'src/services/token.service';
import { UserService } from 'src/services/user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  @Get('info/delete')
  getUserDeleteInfo(): ResponseData {
    return {
      message:
        '[DELETE] /user - delete user account. Must contain access token as Bearer token in the header Authorization. ' +
        '[DELETE] https://auth.mandacode.com/api/core/user',
    };
  }

  @Delete()
  async deleteUser(@Req() req: Request): Promise<ResponseData> {
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
      throw new NotFoundException('access token not found');
    }

    const payload = await this.tokenService.verifyAccessToken(accessToken);

    // Delete user
    await this.userService.deleteUser(payload.uuid);

    return {
      message: 'success',
    };
  }
}
