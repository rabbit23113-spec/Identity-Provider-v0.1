import { Injectable, NotFoundException } from '@nestjs/common';
import { SessionRepository } from '../repositories/session.repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SessionsQueries {
  constructor(
    @InjectRepository(SessionRepository) private readonly sessionRepository: Repository<SessionRepository>,
  ) {}

  async findOne(sessionId: string): Promise<SessionRepository> {
    const target: SessionRepository | null =
      await this.sessionRepository.findOneBy({ sessionId });
    if (!target) {
      throw new NotFoundException(`Session with id ${sessionId} not found`);
    }
    return target;
  }
}
