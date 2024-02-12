import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSettings } from './infrastructure/settings/app.settings';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appSettings(app, AppModule);
  await app.listen(PORT, () => {
    console.log(`App started at http://localhost:${PORT}`);
  });
}
bootstrap();
