import {
  CreateUserInputModel,
  UserViewModel,
} from '../../../users/api/users.models';
import { UsersService } from '../../../users/application/users.service';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

@Injectable()
export class CreateUserByAdminUseCase {
  constructor(
    private usersService: UsersService,
    private usersRepository: UsersRepository,
  ) {}

  async createUser(InputModel: CreateUserInputModel): Promise<UserViewModel> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this.usersService.generateHash(
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
}
