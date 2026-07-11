import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { constants } from '../constants/app.constants';

@Injectable()
export class AuthService {
  constructor(
    @Inject(constants.KAFKA_CLIENT) private readonly clientKafka: ClientKafka,
  ) {}

  async register() {}
  async login() {}
  async revoke() {}
  async rotate() {}

  async oauthGenUrl() {}
  async oauthCallback() {}

}
