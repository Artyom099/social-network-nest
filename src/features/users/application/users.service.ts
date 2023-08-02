import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import {
  CreateUserInputModel,
  SaltHashModel,
  UserViewModel,
} from '../api/users.models';
import * as bcrypt from 'bcrypt';
import { User } from '../users.schema';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async createUser2(InputModel: CreateUserInputModel): Promise<User> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this.generateHash(
      InputModel.password,
      passwordSalt,
    );
    // создание умного юзера через репозиторий
    const user = await this.usersRepository.createUserByAdmin(
      InputModel,
      passwordSalt,
      passwordHash,
    );
    // сохранение умного юзера через репозиторий
    await this.usersRepository.save(user);
    return user;
  }

  async createUser(InputModel: CreateUserInputModel): Promise<UserViewModel> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this.generateHash(
      InputModel.password,
      passwordSalt,
    );
    // создание умного юзера через репозиторий
    const user = await this.usersRepository.createUserByAdmin(
      InputModel,
      passwordSalt,
      passwordHash,
    );
    // сохранение умного юзера через репозиторий
    await this.usersRepository.save(user);
    return user.getViewModel();
  }
  async deleteUser(userId: string) {
    return this.usersRepository.deleteUser(userId);
  }

  async generateSaltAndHash(password: string): Promise<SaltHashModel> {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return { salt, hash };
  }

  async generateHash(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}
