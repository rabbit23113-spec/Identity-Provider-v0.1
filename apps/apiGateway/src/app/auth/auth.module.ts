import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { constants } from '../constants/app.constants';

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
          producerOnlyMode: true,
        },
      },
    ]),
    AuthModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
