import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  app.setGlobalPrefix('api/v1');

  // AJUSTE 1: Habilitar CORS para aceptar a Vercel en producción
  app.enableCors({
    origin: '*', // Cambia el '*' por process.env.CORS_ORIGIN si lo configuras en PM2
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT ?? 3000;
  
  // AJUSTE 2: Escuchar en '0.0.0.0' para abrir el puerto a la IP pública de la VPS
  await app.listen(port, '0.0.0.0');
  console.log(`Application running on port ${port}`);
}

bootstrap();
