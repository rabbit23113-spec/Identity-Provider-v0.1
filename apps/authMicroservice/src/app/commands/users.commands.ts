import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/users/createUser.dto';
import {
  OutboxAction,
  OutboxDomain,
  OutboxRepository,
} from '../repositories/outbox.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersCommands {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: Repository<UserRepository>,
    @InjectRepository(OutboxRepository)
    private readonly outboxRepository: Repository<OutboxRepository>,
  ) {}

  async createOne(dto: CreateUserDto): Promise<UserRepository> {
    try {
      const user: UserRepository = this.userRepository.create(dto);
      await this.userRepository.save(user);
      const event: OutboxRepository = this.outboxRepository.create({
        domain: OutboxDomain.USER,
        action: OutboxAction.CREATE,
        payload: user,
      });
      await this.outboxRepository.save(event);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
