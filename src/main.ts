import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { ENV_VAR } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning({
    type: VersioningType.URI,
  });
  /* app.enableCors({
    origin: 'http://localhost:5173',   // or ['http://localhost:5173', …]
    exposedHeaders: ['Location'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,                // if you send cookies/Authorization
  }); */
  await app.listen(ENV_VAR.PORT || '3000');
}
bootstrap();
