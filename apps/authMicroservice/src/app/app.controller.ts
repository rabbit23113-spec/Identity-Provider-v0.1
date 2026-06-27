import { Controller } from '@nestjs/common';
import { Commands } from './commands/app.commands';
import { Queries } from './queries/app.queries';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateSessionDto } from './dto/sessions/createSession.dto';
import { RotateSessionDto } from './dto/sessions/rotateSession.dto';

@Controller()
export class AppController {
  constructor(
    private readonly commands: Commands,
    private readonly queries: Queries,
  ) {}

  @MessagePattern({ cmd: 'auth.findOne' })
  async findSessionBySessionId(@Payload() payload: { sessionId: string }) {
    return await this.queries.sessionsQueries.findOne(payload.sessionId);
  }

  @MessagePattern({ cmd: 'auth.register' })
  async register(@Payload() payload: { dto: CreateSessionDto }) {
    return await this.commands.sessions.register(payload.dto);
  }

  @MessagePattern({ cmd: 'auth.login' })
  async login(@Payload() payload: { dto: CreateSessionDto }) {
    return await this.commands.sessions.login(payload.dto);
  }

  @MessagePattern({ cmd: 'auth.rotate' })
  async rotate(@Payload() payload: { dto: RotateSessionDto }) {
    return await this.commands.sessions.rotate(payload.dto);
  }

  @MessagePattern({ cmd: 'auth.revoke' })
  async revoke(@Payload() payload: { sessionId: string }) {
    return await this.commands.sessions.revoke(payload.sessionId);
  }
}
