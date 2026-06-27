import { UserStatus } from '../../entities/user.repository';

export class CreateUserDto {
  email: string;
  passwordHash: string;
  status?: UserStatus;
}
