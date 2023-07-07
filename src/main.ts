import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const errorsForResponse: any = [];

        errors.forEach((e) => {
          const constraintsKeys = Object.keys(e.constraints as {});
          constraintsKeys.forEach((cKey) => {
            if (e.constraints) {
              errorsForResponse.push(e.constraints[cKey]);
            }
          });
        });

        throw new BadRequestException(errorsForResponse);
      },
    }),
  );
  await app.listen(3000);
}
bootstrap();
