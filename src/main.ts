import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove extra fields not in DTO
      forbidNonWhitelisted: true, // Throw error if extra fields
      transform: true, // Transform payload to DTO instance
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
