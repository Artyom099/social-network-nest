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

  async getUser(userId: string): Promise<User | null> {
    //достали тупого юзер
    return this.usersRepository.getUserById(userId);
  }
  async createUser(InputModel: CreateUserInputModel): Promise<string> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await UsersService._generateHash(
      InputModel.password,
      passwordSalt,
    );
    //создание умного юзера
    // const smartUser = User.createUserByAdmin(
    //   InputModel,
    //   passwordSalt,
    //   passwordHash,
    // );
    const userDTO = { ...InputModel, passwordSalt, passwordHash };
    // сохранение умного юзера через репозиторий
    const user = await this.usersRepository.createUser(userDTO);

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
