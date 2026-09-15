import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so the React frontend can communicate with the backend
  app.enableCors();

  // Log every incoming HTTP request (visible in local terminal & Render logs)
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      console.log(
        `[${req.method}] ${req.originalUrl || req.url} - ${res.statusCode} (${Date.now() - start}ms)`
      );
    });
    next();
  });

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
