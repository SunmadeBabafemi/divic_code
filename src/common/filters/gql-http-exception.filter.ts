import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';

@Catch()
export class GqlHttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const ctx = gqlHost.getContext();
    const response = ctx?.res;
    const request = ctx?.req;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error' || {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception.status && exception.message) {
      status = exception.status;
      message = exception.message;
    }

    if (response && !response.headersSent) {
      response.status(status).json({
        statusCode: status,
        message: message,
      });
    }
  }
}