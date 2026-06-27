import { UserStatus } from '../../repositories/user.repository';

export class UpdateUserDto {
  id: string;
  email?: string;
  password?: string;
  status?: UserStatus;
}
