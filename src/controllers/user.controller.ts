import { Controller, Delete, NotFoundException, Req } from '@nestjs/common';
import { Request } from 'express';
import { TokenService } from 'src/services/token.service';
import { UserService } from 'src/services/user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  @Delete()
  async deleteUser(@Req() req: Request): Promise<{ message: string }> {
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
