import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { AppModule } from './modules/app/app.module';
import { API_PREFIX } from './shared/constants/global.constants';
import { GLOBAL_CONFIG } from './shared/configs/global.config';
import { setApp } from './shared/helpers/functions';
import { PrismaService } from './modules/prisma/prisma.service';
import { InvalidFormExceptionFilter } from './shared/filters/invalid.form.exception.filter';
import { SwaggerConfig } from './shared/configs/config.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setApp(app);
  app.setGlobalPrefix(API_PREFIX);
  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    }),
  );
  // setApp(app);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
