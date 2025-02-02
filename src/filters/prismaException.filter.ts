import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Request, Response } from 'express';
import { ResponseError } from 'src/interfaces/response.interface';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = 500;
    const message = exception.message;
    const name = 'PrismaClientKnownRequestError';

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
