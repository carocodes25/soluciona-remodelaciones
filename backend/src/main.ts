import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Security
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  }));
  app.use(compression());

  // CORS - Allow multiple origins
  const corsOrigins = configService.get('CORS_ORIGINS', 'http://localhost:3000');
  const allowedOrigins = corsOrigins.split(',').map(origin => origin.trim());
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Prisma shutdown hook
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Soluciona Remodelaciones API')
    .setDescription(
      'Marketplace API para conectar clientes con maestros de remodelación en Colombia',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticación y registro')
    .addTag('users', 'Gestión de usuarios')
    .addTag('pros', 'Perfiles de maestros')
    .addTag('categories', 'Categorías y skills')
    .addTag('jobs', 'Solicitudes de trabajo')
    .addTag('proposals', 'Cotizaciones')
    .addTag('contracts', 'Contratos y hitos')
    .addTag('payments', 'Pagos y transacciones')
    .addTag('reviews', 'Reseñas y calificaciones')
    .addTag('search', 'Búsqueda de maestros')
    .addTag('messaging', 'Chat y mensajería')
    .addTag('admin', 'Panel de administración')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start server
  const port = configService.get('PORT', 4000);
  await app.listen(port, '0.0.0.0');

  console.log(`
    🚀 Soluciona Remodelaciones API
    📝 Server running on: http://0.0.0.0:${port}
    📚 API Documentation: http://0.0.0.0:${port}/api/docs
    🔍 Environment: ${configService.get('NODE_ENV', 'development')}
  `);
}

bootstrap();
