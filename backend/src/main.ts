import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // IMPORTANTE: Permitir conexiones desde cualquier origen
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  // Escuchar en todas las interfaces de red (0.0.0.0)
  await app.listen(3000, '0.0.0.0');
  
  console.log('🚀 Backend corriendo en:');
  console.log('   - Local: http://localhost:3000');
  console.log('   - Red:   http://TU_IP:3000');
}
bootstrap();