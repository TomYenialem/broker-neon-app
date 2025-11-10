import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Enable validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove extra fields not in DTO
      forbidNonWhitelisted: true, // Throw error if extra fields
      transform: true, // Transform payload to DTO instance
      transformOptions: {
        enableImplicitConversion: true, // Allow primitive type conversion
      },
    }),
  );

  // Set global prefix
  app.setGlobalPrefix('api');

  // Serve static files (uploaded images/videos)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Broker Platform API')
    .setDescription(
      'Complete API documentation for the Angolan Broker Platform - supporting Land, Cars, Houses, and Machines listings with JWT authentication',
    )
    .setVersion('1.0')
    .addTag(
      'Authentication',
      'User registration, login, and JWT token management',
    )
    .addTag('Car Listings', 'Create, read, update, and delete car listings')
    .addTag('Land Listings', 'Create, read, update, and delete land listings')
    .addTag('House Listings', 'Create, read, update, and delete house listings')
    .addTag(
      'Machine Listings',
      'Create, read, update, and delete machine/equipment listings',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:5000', 'Development Server')
    .addServer('https://broker-app-aa17.onrender.com', 'Production Server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Broker API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { font-size: 36px; }
    `,
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(`📚 Swagger Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
