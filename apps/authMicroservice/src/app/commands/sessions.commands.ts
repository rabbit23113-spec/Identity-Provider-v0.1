import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { SessionRepository } from '../repositories/session.repository';
import { CreateSessionDto } from '../dto/sessions/createSession.dto';
import { TokensDto } from '../dto/sessions/tokens.dto';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UsersCommands } from './users.commands';
import { randomBytes } from 'node:crypto';
import {
  OutboxAction,
  OutboxDomain,
  OutboxRepository,
} from '../repositories/outbox.repository';
import { UsersQueries } from '../queries/users.queries';
import { RotateSessionDto } from '../dto/sessions/rotateSession.dto';
import { SessionsQueries } from '../queries/sessions.queries';
import { UserRepository } from '../repositories/user.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SessionsCommands {
  constructor(
    @InjectRepository(SessionRepository)
    private readonly sessionRepository: Repository<SessionRepository>,
    @InjectRepository(OutboxRepository)
    private readonly outboxRepository: Repository<OutboxRepository>,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(UsersCommands) private readonly usersCommands: UsersCommands,
    @Inject(UsersCommands) private readonly usersQueries: UsersQueries,
    @Inject(SessionsQueries) private readonly sessionsQueries: SessionsQueries,
  ) {}

  async createSession(): Promise<TokensDto> {
    const salt = 14;
    const refreshToken: string = randomBytes(32).toString('base64url');
    const refreshTokenHash: string = await bcrypt.hash(refreshToken, salt);
    const expiresAt: Date = new Date(Date.now() / 1000 + 60 * 5);
    const session: SessionRepository = this.sessionRepository.create({
      refreshTokenHash,
      expiresAt,
    });
    await this.sessionRepository.save(session);
    const event: OutboxRepository = this.outboxRepository.create({
      domain: OutboxDomain.SESSION,
      action: OutboxAction.CREATE,
      payload: session,
    });
    await this.outboxRepository.save(event);
    const accessToken: string = await this.jwtService.signAsync({
      pub: session.sessionId,
    });
    return {
      refreshToken,
      accessToken,
    };
  }

  async register(dto: CreateSessionDto): Promise<TokensDto> {
    try {
      const { email, password } = dto;
      const salt = 14;
      const passwordHash: string = await bcrypt.hash(password, salt);
      await this.usersCommands.createOne({ email, passwordHash });
      return this.createSession();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async login(dto: CreateSessionDto): Promise<TokensDto> {
    const { email, password } = dto;
    const user: UserRepository = await this.usersQueries.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch: boolean = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return await this.createSession();
  }

  async revoke(sessionId: string): Promise<void> {
    const session: SessionRepository =
      await this.sessionsQueries.findOne(sessionId);
    if (!session) {
      throw new NotFoundException('Invalid session');
    }
    await this.sessionRepository.update(
      { sessionId },
      { revokedAt: new Date() },
    );
    const event: OutboxRepository = this.outboxRepository.create({
      domain: OutboxDomain.SESSION,
      action: OutboxAction.REVOKE,
      payload: session,
    });
    await this.outboxRepository.save(event);
  }

  async rotate(dto: RotateSessionDto): Promise<TokensDto> {
    const { sessionId, refreshToken } = dto;
    const session: SessionRepository =
      await this.sessionsQueries.findOne(sessionId);
    if (!session) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (
      session.rotatedAt ||
      session.revokedAt ||
      session.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { refreshTokenHash } = session;
    const isMatch: boolean = await bcrypt.compare(
      refreshToken,
      refreshTokenHash,
    );
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    await this.sessionRepository.update(
      { sessionId },
      { rotatedAt: new Date() },
    );
    const event: OutboxRepository = this.outboxRepository.create({
      domain: OutboxDomain.SESSION,
      action: OutboxAction.ROTATE,
      payload: session,
    });
    await this.outboxRepository.save(event);
    return await this.createSession();
  }
}
