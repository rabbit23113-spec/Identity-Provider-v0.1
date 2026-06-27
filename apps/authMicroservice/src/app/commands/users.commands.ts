import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserRepository } from '../entities/user.repository';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/users/createUser.dto';
import { OutboxRepository } from '../entities/outbox.repository';

@Injectable()
export class UsersCommands {
  constructor(
    private readonly userRepository: Repository<UserRepository>,
    private readonly outboxRepository: Repository<OutboxRepository>,
  ) {}

  async createOne(dto: CreateUserDto): Promise<UserRepository> {
    try {
      const user: UserRepository = this.userRepository.create(dto);
      await this.userRepository.save(user);
      const event: OutboxRepository = this.outboxRepository.create({
        eventType: 'users.created',
        payload: user,
      });
      await this.outboxRepository.save(event);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
