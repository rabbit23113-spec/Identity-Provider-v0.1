import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { constants } from '../constants/app.constants';
import { CreateSessionDto } from '../dto/sessions/createSession.dto';
import { TokensDto } from '../dto/sessions/tokens.dto';
import { firstValueFrom } from 'rxjs';
import { RotateSessionDto } from '../dto/sessions/rotateSession.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(constants.KAFKA_CLIENT) private readonly clientKafka: ClientKafka,
  ) {}



  async register(dto: CreateSessionDto): Promise<TokensDto> {
    return await firstValueFrom(
      this.clientKafka.send( 'auth.register', { dto }),
    );
  }

  async login(dto: CreateSessionDto): Promise<TokensDto> {
    return await firstValueFrom(
      this.clientKafka.send( 'auth.login', { dto }),
    );
  }
  async rotate(dto: RotateSessionDto): Promise<TokensDto> {
    return await firstValueFrom(
      this.clientKafka.send( 'auth.rotate', { dto }),
    );
  }

  async revoke(sessionId: string) {
    return await firstValueFrom(
      this.clientKafka.emit( 'auth.revoke', { sessionId }),
    );
  }

  async oauthGenUrl(clientId: string, redirectUri: string) {
    return await firstValueFrom(
      this.clientKafka.send( 'oauth.genUrl', { clientId, redirectUri }),
    );
  }
  async oauthCallback(code: string, state: string) {
    return await firstValueFrom(
      this.clientKafka.send( 'oauth.callback', { code, state }),
    );
  }
}
