import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class AppController {
  constructor() {}

  // Hello World! is returned when the root URL is accessed
  @Get('/')
  getHello(): string {
    return 'Hello World!';
  }
}
