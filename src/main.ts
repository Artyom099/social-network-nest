import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSettings } from './app.settings';

async function bootstrap() {
  const rawApp = await NestFactory.create(AppModule);
  const app = appSettings(rawApp);
  await app.listen(3000);
}
bootstrap();
