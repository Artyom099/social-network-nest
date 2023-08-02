import { UsersService } from '../../../users/application/users.service';
import {
  CreateUserInputModel,
  UserViewModel,
} from '../../../users/api/users.models';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private usersService: UsersService,
    private usersRepository: UsersRepository,
  ) {}

  async createUser(InputModel: CreateUserInputModel): Promise<UserViewModel> {
    const { salt, hash } = await this.usersService.generateSaltAndHash(
      InputModel.password,
    );
    // создание умного юзера через репозиторий
    const user = await this.usersRepository.createUserBySelf(
      InputModel,
      salt,
      hash,
    );
    // сохранение умного юзера через репозиторий
    await this.usersRepository.save(user);
    return user.getViewModel();
  }
}
