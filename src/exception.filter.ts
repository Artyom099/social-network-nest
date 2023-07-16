import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // console.log({ exception: exception });
    if (status === HttpStatus.BAD_REQUEST) {
      const errorsMessages: any = [];
      const responseBody: any = exception.getResponse();
      //todo можно ли оставить never?

      console.log({ responseBody_1: responseBody });
      // console.log({ responseBody_1: responseBody.message });
      if (typeof responseBody.message === 'string') {
        const [message, field] = responseBody.message.split('=>');
        errorsMessages.push({ message, field });
        // return response.status(status).send({ message, field });
      } else {
        responseBody.message.forEach((m: never) => errorsMessages.push(m));
      }

      response.status(status).json({ errorsMessages });
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}

@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    console.log({ responseBody_2: exception.getResponse() });

    if (process.env.environment !== 'production') {
      response
        .status(500)
        .send({ error: exception.toString(), stack: exception.stack });
    } else {
      response.status(500).send('some error occurred');
    }
  }
}
