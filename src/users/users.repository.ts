import { Injectable } from '@nestjs/common';
import { GetUsersWithPagingAndSearch, UserViewModel } from './users.models';

@Injectable()
export class UsersRepository {
  getUser(term: GetUsersWithPagingAndSearch) {
    return [
      { id: 1, name: 'Dimych' },
      { id: 2, name: 'Victor' },
    ];
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
