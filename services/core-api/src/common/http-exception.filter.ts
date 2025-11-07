import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Set Content-Type to application/json for all error responses
    response.setHeader('Content-Type', 'application/json');

    // Handle 404 for unhandled routes under /v1/*
    if (
      exception instanceof NotFoundException ||
      (exception instanceof HttpException && exception.getStatus() === HttpStatus.NOT_FOUND)
    ) {
      // Check if it's a /v1/* route
      if (request.path.startsWith('/v1/')) {
        response.status(HttpStatus.NOT_FOUND).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Route not found',
          },
        });
        return;
      }
    }

    // Handle other HTTP exceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Format error response
      const errorResponse: any = {
        error: {
          code: this.getErrorCode(status),
          message:
            typeof exceptionResponse === 'string'
              ? exceptionResponse
              : (exceptionResponse as any).message || exception.message || 'An error occurred',
        },
      };

      response.status(status).json(errorResponse);
      return;
    }

    // Handle internal server errors (500)
    console.error('Internal server error:', exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An internal server error occurred',
      },
    });
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'VALIDATION_ERROR';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMIT_EXCEEDED';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'INTERNAL_ERROR';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'SERVICE_UNAVAILABLE';
      default:
        return 'UNKNOWN_ERROR';
    }
  }
}

