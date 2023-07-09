import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      // forbidUnknownValues: false,
      exceptionFactory: (errors) => {
        const errorsForResponse: any = [];

        errors.forEach((e) => {
          const constraintsKeys = Object.keys(e.constraints as {});
          constraintsKeys.forEach((cKey) => {
            if (e.constraints) {
              errorsForResponse.push({
                message: e.constraints[cKey],
                field: e.property,
              });
            }
          });
        });

        throw new BadRequestException(errorsForResponse);
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
