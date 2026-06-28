import { UserStatus } from '../../repositories/user.repository';

export class CreateUserDto {
  email: string;
  passwordHash?: string;
  status?: UserStatus;
}
