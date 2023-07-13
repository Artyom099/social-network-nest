import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserInputModel, UserViewModel } from './users.models';
import * as bcrypt from 'bcrypt';
import { User } from './users.schema';
import { UsersQueryRepository } from './users.query.repository';

@Injectable()
export class UsersService {
  constructor(
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  async getUser(userId: string): Promise<UserViewModel | null> {
    return this.usersRepository.getUserById(userId);
  }

  async createUser(InputModel: CreateUserInputModel): Promise<UserViewModel> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await UsersService._generateHash(
      InputModel.password,
      passwordSalt,
    );
    //создание умного юзера
    const smartUser = User.createUser(InputModel, passwordSalt, passwordHash);
    // сохранение умного юзера
    await this.usersRepository.createUser(smartUser);
    // возврщение ViewModel
    return smartUser.getViewModel();
  }
  async deleteUser(userId: string) {
    return this.usersRepository.deleteUser(userId);
  }

  static async _generateHash(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}
