import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { OauthRepository } from '../repositories/oauth.repository';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { constants } from '../constants/app.constants';
import { randomBytes } from 'node:crypto';
import axios from 'axios';
import { TokensDto } from '../dto/sessions/tokens.dto';
import { UsersCommands } from './users.commands';
import { UsersQueries } from '../queries/users.queries';
import { UserRepository } from '../repositories/user.repository';
import { SessionsCommands } from './sessions.commands';
import {OutboxRepository} from "../repositories/outbox.repository";

@Injectable()
export class OauthCommands {
  constructor(
    private readonly oauthRepository: Repository<OauthRepository>,
    private readonly outboxRepository: Repository<OutboxRepository>,
    @Inject(UsersCommands) private readonly usersCommands: UsersCommands,
    @Inject(UsersQueries) private readonly usersQueries: UsersQueries,
    @Inject(SessionsCommands)
    private readonly sessionsCommands: SessionsCommands,
    @Inject(constants.REDIS_PROVIDER) private readonly redis: Redis,
  ) {}

  async oauthGenUrl(
    oauthClientId: string,
    redirectUri: string,
  ): Promise<string> {
    const oauthClient: OauthRepository | null =
      await this.oauthRepository.findOneBy({
        clientId: oauthClientId,
      });
    if (!oauthClient || !oauthClient.redirectUris.includes(redirectUri)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const state = await this.setOauthState(oauthClientId, redirectUri);
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');

    url.searchParams.set('client_id', constants.GOOGLE_CLIENT_ID);
    url.searchParams.set('redirect_uri', constants.GOOGLE_REDIRECT_URI);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('state', state);

    return url.toString();
  }

  private async setOauthState(oauthClientId: string, redirectUri: string) {
    const state: string = randomBytes(32).toString('base64url');
    await this.redis.set(
      state,
      JSON.stringify({
        clientId: oauthClientId,
        redirectUri,
      }),
    );
    return state;
  }

  async handleCallback(code: string, state: string): Promise<string> {
    const stateFromRedis = await this.redis.get(state);
    if (!stateFromRedis) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const stateData = JSON.parse(stateFromRedis);
    await this.redis.del(state);

    const googleToken = await this.exchangeCode(code);
    const userInfo = await this.getGoogleUserInfo(googleToken.access_token);

    await this.findOrCreateUser(userInfo.email);
    const tokens: TokensDto = await this.sessionsCommands.createSession();
    const url = new URL(stateData.redirectUri);
    url.searchParams.set('access_token', tokens.accessToken);
    url.searchParams.set('refresh_token', tokens.refreshToken);

    return url.toString();
  }

  private async findOrCreateUser(email: string): Promise<UserRepository> {
    const existedUser: UserRepository | null =
      await this.usersQueries.findOneByEmail(email);
    if (existedUser) return existedUser;
    return await this.usersCommands.createOne({ email });
  }

  private async exchangeCode(code: string) {
    const res = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        client_id: constants.GOOGLE_CLIENT_ID,
        client_secret: constants.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: constants.GOOGLE_REDIRECT_URI,
      }),
    );

    return res.data;
  }

  private async getGoogleUserInfo(accessToken: string) {
    const res = await axios.get(
      'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return res.data;
  }
}
