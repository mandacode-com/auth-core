import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import crypto from 'crypto';

@Injectable()
export class CodeService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async genCode(uuid: string): Promise<string> {
    const code = crypto.randomBytes(16).toString('hex');
    await this.cacheManager.set(code, uuid).catch(() => {
      throw new InternalServerErrorException('Failed to save code');
    });
    return code;
  }

  async getUuid(code: string): Promise<string | undefined> {
    return this.cacheManager
      .get(code)
      .then((uuid) => {
        this.cacheManager.del(code);
        return uuid as string | undefined;
      })
      .catch(() => {
        throw new InternalServerErrorException('Failed to get uuid');
      });
  }
}
