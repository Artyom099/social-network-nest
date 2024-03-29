import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSettings } from './infrastructure/settings/app.settings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appSettings(app, AppModule);

  const PORT = process.env.PORT || 3004;
  await app.listen(PORT, () => {
    console.log(`App started at http://localhost:${PORT}`);
  });
}
bootstrap();
