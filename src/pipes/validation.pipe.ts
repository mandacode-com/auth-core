import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { z, ZodError, ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private validator: ZodSchema) {}
  async transform(value: any): Promise<z.infer<typeof this.validator>> {
    const result = await this.validator
      .parseAsync(value)
      .catch((error: ZodError) => {
        throw new BadRequestException(error.errors);
      });
    return result;
  }
}
