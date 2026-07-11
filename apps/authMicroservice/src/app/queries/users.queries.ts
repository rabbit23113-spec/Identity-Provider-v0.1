import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersQueries {
  constructor(@InjectRepository(UserRepository) private readonly userRepository: Repository<UserRepository>) {}

  async findOne(userId: string): Promise<UserRepository> {
    const target: UserRepository | null = await this.userRepository.findOneBy({ userId });
    if (!target) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return target;
  }

  async findOneByEmail(email: string): Promise<UserRepository> {
    const target: UserRepository | null = await this.userRepository.findOneBy({ email });
    if (!target) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return target;
  }
}
