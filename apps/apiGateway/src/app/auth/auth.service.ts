import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { constants } from '../constants/app.constants';
import { CreateSessionDto } from '../dto/sessions/createSession.dto';
import { TokensDto } from '../dto/sessions/tokens.dto';
import { firstValueFrom } from 'rxjs';
import { RotateSessionDto } from '../dto/sessions/rotateSession.dto';
import { CreateClientDto } from '../dto/oauth/createClient.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @Inject(constants.KAFKA_CLIENT) private readonly clientKafka: ClientKafka,
  ) {}

  async onModuleInit() {
    this.clientKafka.subscribeToResponseOf('auth.register');
    this.clientKafka.subscribeToResponseOf('auth.login');
    this.clientKafka.subscribeToResponseOf('auth.rotate');
    this.clientKafka.subscribeToResponseOf('oauth.genUrl');
    this.clientKafka.subscribeToResponseOf('oauth.callback');

    await this.clientKafka.connect();
  }

  async register(dto: CreateSessionDto): Promise<TokensDto> {
    return await firstValueFrom(
      this.clientKafka.send('auth.register', { dto }),
    );
  }

  async login(dto: CreateSessionDto): Promise<TokensDto> {
    return await firstValueFrom(this.clientKafka.send('auth.login', { dto }));
  }
  async rotate(dto: RotateSessionDto): Promise<TokensDto> {
    return await firstValueFrom(this.clientKafka.send('auth.rotate', { dto }));
  }

  async revoke(sessionId: string) {
    return await firstValueFrom(
      this.clientKafka.emit('auth.revoke', { sessionId }),
    );
  }

  async oauthGenUrl(clientId: string, redirectUri: string) {
    return await firstValueFrom(
      this.clientKafka.send('oauth.genUrl', { clientId, redirectUri }),
    );
  }
  async oauthCallback(code: string, state: string) {
    return await firstValueFrom(
      this.clientKafka.send('oauth.callback', { code, state }),
    );
  }
  async oauthCreateClient(dto: CreateClientDto) {
    return await firstValueFrom(
      this.clientKafka.send('oauth.createClient', { dto }),
    );
  }
}
