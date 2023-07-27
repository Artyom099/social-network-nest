import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSettings } from './infrastructure/settings/app.settings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appSettings(app);
  await app.listen(3000);
}
bootstrap();
