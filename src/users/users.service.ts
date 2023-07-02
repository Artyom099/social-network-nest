import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import {
  CreateUserInputModel,
  GetUsersWithPagingAndSearch,
  UserViewModel,
} from './users.models';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(protected usersRepository: UsersRepository) {}
  getUser(term: GetUsersWithPagingAndSearch) {
    return this.usersRepository.getUser(term);
  }
  createUser(InputModel: CreateUserInputModel): UserViewModel {
    const passwordSalt = bcrypt.genSalt(10);
    const passwordHash = this._generateHash(InputModel.password, passwordSalt);
    const newUser = {
      id: randomUUID().toString(),
      accountData: {
        login: InputModel.login,
        email: InputModel.email,
        passwordHash,
        passwordSalt,
        createdAt: new Date().toISOString(),
      },
    };
    return this.usersRepository.createUser(newUser);
  }
  _generateHash(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }
  deleteUser(userId: string) {
    return this.usersRepository.deleteUser(userId);
  }
}
