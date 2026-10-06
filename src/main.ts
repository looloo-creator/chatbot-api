import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configuredOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = new Set([
    'http://localhost:4200',
    'http://localhost:8080',
    'http://localhost:18080',
    ...configuredOrigins,
  ]);

  app.enableCors({
    origin: (origin, callback) => {
      const localDevelopmentOrigin = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '');
      callback(null, !origin || allowedOrigins.has(origin) || localDevelopmentOrigin);
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Chatbot API is running on http://localhost:${port}`);
}

bootstrap();
