import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commands } from './commands/app.commands';
import { AuthCodeRepository } from './entities/authCode.repository';
import { OauthRepository } from './entities/oauth.repository';
import { OutboxRepository } from './entities/outbox.repository';
import { SessionRepository } from './entities/session.repository';
import { UserRepository } from './entities/user.repository';
import { Queries } from './queries/app.queries';
import { JwtModule } from '@nestjs/jwt';

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
  ],
  controllers: [AppController],
  providers: [Commands, Queries],
})
export class AppModule {}
