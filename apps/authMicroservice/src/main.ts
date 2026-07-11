/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { constants } from './app/constants/app.constants';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: ['kafka:9092'],
          clientId: constants.KAFKA_CLIENT_ID,
        },
        consumer: {
          groupId: 'auth-consumer-group',
        },
      },
    },
  );
  await app.listen();
  Logger.log(`AUTH MICROSERVICE IS RUNNING`);
}

bootstrap();
