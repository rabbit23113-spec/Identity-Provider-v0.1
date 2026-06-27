import { Injectable, NotFoundException } from '@nestjs/common';
import { SessionRepository } from '../entities/session.repository';
import { Repository } from 'typeorm';

@Injectable()
export class SessionsQueries {
  constructor(
    private readonly sessionRepository: Repository<SessionRepository>,
  ) {}

  async findAll(): Promise<SessionRepository[]> {
    return this.sessionRepository.find();
  }

  async findOne(sessionId: string): Promise<SessionRepository> {
    const target: SessionRepository | null =
      await this.sessionRepository.findOneBy({ sessionId });
    if (!target) {
      throw new NotFoundException(`Session with id ${sessionId} not found`);
    }
    return target;
  }
}
