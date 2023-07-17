import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './exception.filter';

export const appSettings = (app: INestApplication) => {
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      // forbidUnknownValues: false,
      exceptionFactory: (errors) => {
        // console.log({ errors: errors });

        const errorsForResponse: any = [];
        errors.forEach((err) => {
          // console.log({ err: err });
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
  app.enableCors();
  app.useGlobalFilters(new HttpExceptionFilter());
};
// , new ErrorExceptionFilter()
