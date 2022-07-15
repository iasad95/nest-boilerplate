import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StructuredLogger } from '../logger/structured-logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: StructuredLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const httpContext = host.switchToHttp();
    const response = httpContext.getResponse<Response>();
    const request = httpContext.getRequest<Request & { requestId?: string }>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const rawMessage =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : ((exceptionResponse as { message?: unknown }).message ??
          'Internal server error');

    const normalizedMessage = Array.isArray(rawMessage)
      ? (rawMessage as string[]).join(', ')
      : String(rawMessage);

    const trace = exception instanceof Error ? exception.stack : undefined;

    this.logger.error(
      {
        statusCode: status,
        requestId: request.requestId,
        path: request.url,
        method: request.method,
        message: normalizedMessage,
      },
      trace,
      'GlobalExceptionFilter',
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      requestId: request.requestId,
      path: request.url,
      message: normalizedMessage,
    });
  }
}
