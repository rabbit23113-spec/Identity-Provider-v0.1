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
import { constants } from './constants/app.constants';
import { RedisProvider } from './utils/redisProvider/redis.provider';
import { UsersCommands } from './commands/users.commands';
import { OauthCommands } from './commands/oauth.commands';
import { SessionsCommands } from './commands/sessions.commands';
import { UsersQueries } from './queries/users.queries';
import { OauthQueries } from './queries/oauth.queries';
import { SessionsQueries } from './queries/sessions.queries';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: constants.POSTGRES_HOST,
      port: 5432,
      username: constants.POSTGRES_USER,
      password: constants.POSTGRES_PASSWORD,
      database: constants.POSTGRES_DB,
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
      OauthRepository,
      SessionRepository,
      UserRepository,
    ]),
    JwtModule.register({
      secret: constants.JWT_SECRET,
      signOptions: {
        expiresIn: '5m',
      },
    }),
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
  ],
  controllers: [AppController],
  providers: [
    RedisProvider,
    Commands,
    Queries,
    UsersCommands,
    OauthCommands,
    SessionsCommands,
    UsersQueries,
    OauthQueries,
    SessionsQueries,
  ],
})
export class AppModule {}
