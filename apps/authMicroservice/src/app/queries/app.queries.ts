import { Injectable } from '@nestjs/common';
import { OauthQueries } from './oauth.queries';
import { SessionsQueries } from './sessions.queries';
import { UsersQueries } from './users.queries';

@Injectable()
export class Queries {
  constructor(
    public readonly oauth: OauthQueries,
    public readonly sessions: SessionsQueries,
    public readonly users: UsersQueries,
  ) {}
}
