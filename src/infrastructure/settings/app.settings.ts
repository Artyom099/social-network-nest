import {
  BadRequestException,
  DynamicModule,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { HttpExceptionFilter } from '../exception-filters/exception.filter';

export const appSettings = <T>(app: INestApplication, module: T) => {
  useContainer(app.select(module as DynamicModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      // forbidUnknownValues: false,
      exceptionFactory: (errors) => {
        const errorsForResponse: any = [];

        errors.forEach((err) => {
          const keys = Object.keys(err.constraints || {});
          keys.forEach((key) => {
            if (err.constraints) {
              errorsForResponse.push({
                message: err.constraints[key],
                field: err.property,
              });
            }
          });
        });

        throw new BadRequestException(errorsForResponse);
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(cookieParser());
  app.enableCors();
};
