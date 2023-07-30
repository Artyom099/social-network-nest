import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserInputModel } from '../api/users.models';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(protected usersRepository: UsersRepository) {}

  async createUser(InputModel: CreateUserInputModel): Promise<string> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await UsersService._generateHash(
      InputModel.password,
      passwordSalt,
    );
    // создание умного юзера через репозиторий
    const user = await this.usersRepository.createUser(
      InputModel,
      passwordSalt,
      passwordHash,
    );
    // сохранение умного юзера через репозиторий
    await this.usersRepository.save(user);
    return user.id;
  }
  async deleteUser(userId: string) {
    return this.usersRepository.deleteUser(userId);
  }

  static async _generateHash(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}
