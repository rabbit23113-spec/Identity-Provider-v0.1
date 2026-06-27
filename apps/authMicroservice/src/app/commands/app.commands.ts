import { OauthCommands } from './oauth.commands';
import { SessionsCommands } from './sessions.commands';
import { UsersCommands } from './users.commands';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Commands {
  constructor(
    public readonly oauth: OauthCommands,
    public readonly sessions: SessionsCommands,
    public readonly users: UsersCommands,
  ) {}
}
