import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // Set up Swagger
  const config = new DocumentBuilder()
    .setTitle('Cognitive Assessment API')
    .setDescription('API for submitting and analyzing journal entries using LIWC-style scoring')
    .setVersion('1.0')
    .addBearerAuth() // Important since your API uses JWT!
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Swagger UI at /api

  const port = process.env.PORT || 3000;  
  await app.listen(port);
  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`📚 API Explorer is available at http://localhost:${port}/api`);
}
bootstrap();
