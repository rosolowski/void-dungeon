import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  const port = process.env.BACKEND_PORT
    ? parseInt(process.env.BACKEND_PORT, 10)
    : 3000;

  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}
bootstrap();
