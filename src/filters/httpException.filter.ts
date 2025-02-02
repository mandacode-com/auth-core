import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseError } from 'src/interfaces/response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message = exception.message;
    const name = exception.name;

    const errorResponse: ResponseError = {
      message: message,
      data: {
        error: name,
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    };

    response.status(status).json(errorResponse);
  }
}
