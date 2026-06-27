import { UserStatus } from '../../entities/user.repository';

export class UpdateUserDto {
  id: string;
  email?: string;
  password?: string;
  status?: UserStatus;
}
