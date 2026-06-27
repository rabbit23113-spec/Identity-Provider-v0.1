import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { SessionRepository } from '../entities/session.repository';
import { CreateSessionDto } from '../dto/sessions/createSession.dto';
import { TokensDto } from '../dto/sessions/tokens.dto';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UsersCommands } from './users.commands';
import { randomBytes } from 'node:crypto';
import { OutboxRepository } from '../entities/outbox.repository';
import { UsersQueries } from '../queries/users.queries';

@Injectable()
export class SessionsCommands {
  constructor(
    private readonly sessionRepository: Repository<SessionRepository>,
    private readonly outboxRepository: Repository<OutboxRepository>,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(UsersCommands) private readonly usersCommands: UsersCommands,
    @Inject(UsersCommands) private readonly usersQueries: UsersQueries,
  ) {}

  async register(dto: CreateSessionDto): Promise<TokensDto> {
    try {
      const { email, password } = dto;
      const salt = 14;
      const passwordHash = await bcrypt.hash(password, salt);
      const user = await this.usersCommands.createOne({ email, passwordHash });
      const { userId } = user;
      const refreshToken = randomBytes(32).toString('base64url');
      const refreshTokenHash = await bcrypt.hash(refreshToken, salt);
      const expiresAt = new Date(Date.now() / 1000 + 60 * 5);
      const session = this.sessionRepository.create({
        refreshTokenHash,
        expiresAt,
      });
      await this.sessionRepository.save(session);
      const event = this.outboxRepository.create({
        eventType: 'session.created',
        payload: session,
      });
      await this.outboxRepository.save(event);
      const accessToken = await this.jwtService.signAsync(userId);
      return {
        refreshToken,
        accessToken,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async login(dto: CreateSessionDto): Promise<TokensDto> {
    const { email, password } = dto;
    const user = await this.usersQueries.findOneByEmail(email);
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const salt = 14;
    const { userId } = user;
    const refreshToken = randomBytes(32).toString('base64url');
    const refreshTokenHash = await bcrypt.hash(refreshToken, salt);
    const expiresAt = new Date(Date.now() / 1000 + 60 * 5);
    const session = this.sessionRepository.create({
      refreshTokenHash,
      expiresAt,
    });
    await this.sessionRepository.save(session);
    const event = this.outboxRepository.create({
      eventType: 'session.created',
      payload: session,
    });
    await this.outboxRepository.save(event);
    const accessToken = await this.jwtService.signAsync(userId);
    return {
      refreshToken,
      accessToken,
    };
  }

  async refresh() {}

  async revoke() {}

  async rotate() {}
}
