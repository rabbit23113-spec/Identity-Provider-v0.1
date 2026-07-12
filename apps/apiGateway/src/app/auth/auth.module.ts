import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { constants } from '../constants/app.constants';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: constants.KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: constants.KAFKA_CLIENT_ID,
            brokers: ['kafka:9092'],
          },
          consumer: {
            groupId: 'api-gateway-group',
          },
        },
      },
    ]),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
