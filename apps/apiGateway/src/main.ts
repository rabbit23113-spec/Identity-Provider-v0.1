/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';
import { constants } from './app/constants/app.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'AUTH_SERVICE_CLIENT',
        brokers: ['kafka:9092'],
      },
      consumer: {
        groupId: 'api-gateway-group',
      },
    },
  });
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const config = new DocumentBuilder()
    .setTitle('Identity Provider v0.1')
    .setDescription('This is a documentation of the API')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  const port = process.env.PORT || 3000;
  await app.startAllMicroservices();
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
