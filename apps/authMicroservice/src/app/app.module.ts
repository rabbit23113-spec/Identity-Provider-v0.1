import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commands } from './commands/app.commands';
import { AuthCodeRepository } from './repositories/authCode.repository';
import { OauthRepository } from './repositories/oauth.repository';
import { OutboxRepository } from './repositories/outbox.repository';
import { SessionRepository } from './repositories/session.repository';
import { UserRepository } from './repositories/user.repository';
import { Queries } from './queries/app.queries';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'root',
      password: 'root',
      synchronize: true,
      autoLoadEntities: true,
      entities: [
        AuthCodeRepository,
        OauthRepository,
        OutboxRepository,
        SessionRepository,
        UserRepository,
      ],
    }),
    TypeOrmModule.forFeature([
      AuthCodeRepository,
      OutboxRepository,
      OutboxRepository,
      SessionRepository,
      UserRepository,
    ]),
    JwtModule.register({
      secret: 'secret',
      signOptions: {
        expiresIn: '5m',
      },
    }),
    ClientsModule.register([
      {
        name: 'AUTH_KAFKA',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'AUTH_SERVICE_CLIENT',
            brokers: ['kafka:9092'],
          },
          producerOnlyMode: true,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [Commands, Queries],
})
export class AppModule {}
