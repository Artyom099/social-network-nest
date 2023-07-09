import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserInputModel, UserViewModel } from './users.models';
import * as bcrypt from 'bcrypt';
import { User } from './users.schema';

@Injectable()
export class UsersService {
  constructor(protected usersRepository: UsersRepository) {}

  //

  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  async findOne(username: string) {
    return this.users.find((user) => user.username === username);
  }

  //

  async getUser(userId: string): Promise<UserViewModel | null> {
    return this.usersRepository.getUser(userId);
  }
  async createUser(InputModel: CreateUserInputModel): Promise<UserViewModel> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(
      InputModel.password,
      passwordSalt,
    );
    const newUser = User.create(InputModel, passwordSalt, passwordHash);
    return this.usersRepository.createUser(newUser);
  }
  async deleteUser(userId: string) {
    return this.usersRepository.deleteUser(userId);
  }

  private async _generateHash(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}
