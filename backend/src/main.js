import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so the React frontend can communicate with the backend
  app.enableCors();

  // Validate all incoming request payloads
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend server is running on http://localhost:${port}`);
}

bootstrap();
