import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../entities/user.repository';
import { Repository } from 'typeorm';

@Injectable()
export class UsersQueries {
  constructor(private readonly userRepository: Repository<UserRepository>) {}

  async findOne(userId: string): Promise<UserRepository> {
    const target = await this.userRepository.findOneBy({ userId });
    if (!target) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return target;
  }

  async findOneByEmail(email: string): Promise<UserRepository> {
    const target = await this.userRepository.findOneBy({ email });
    if (!target) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return target;
  }
}
