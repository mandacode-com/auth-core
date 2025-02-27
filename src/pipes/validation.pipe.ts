import { Injectable, PipeTransform } from '@nestjs/common';
import { z, ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private validator: ZodSchema) {}
  async transform(value: any): Promise<z.infer<typeof this.validator>> {
    return await this.validator.parseAsync(value);
  }
}
