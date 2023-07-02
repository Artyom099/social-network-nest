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
  async createUser(InputModel: CreateUserInputModel): Promise<UserViewModel> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(
      InputModel.password,
      passwordSalt,
    );
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
  async _generateHash(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }
  async deleteUser(userId: string) {
    return this.usersRepository.deleteUser(userId);
  }
}
