import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import type { IncomingMessage, ServerResponse } from 'http';

let cachedApp: Awaited<ReturnType<typeof NestFactory.create>> | null = null;

async function getApp() {
  if (cachedApp) return cachedApp;

  cachedApp = await NestFactory.create(AppModule, { logger: false });

  cachedApp.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  cachedApp.setGlobalPrefix('api/v1');
  cachedApp.enableCors({
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  });

  await cachedApp.init();
  return cachedApp;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await getApp();
  const express = app.getHttpAdapter().getInstance();
  express(req, res);
}
