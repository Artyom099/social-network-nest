import { Injectable } from '@nestjs/common';
import { UserViewModel } from './users.models';

@Injectable()
export class UsersRepository {
  getUser(id: string) {
    return {
      id: '1',
      login: 'login',
      email: 'email',
      createdAt: new Date().toISOString(),
    };
  }
  createUser(user): UserViewModel {
    return {
      id: '1',
      login: user.login,
      email: user.email,
      createdAt: new Date().toISOString(),
    };
  }
  deleteUser(id: string) {
    return;
  }
}
