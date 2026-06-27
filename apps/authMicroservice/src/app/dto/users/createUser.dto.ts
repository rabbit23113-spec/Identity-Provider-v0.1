import { UserStatus } from '../../entities/user.repository';

export class CreateUserDto {
  email: string;
  password: string;
  status?: UserStatus;
}
