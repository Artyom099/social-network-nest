import {
  CreateUserInputModel,
  UserViewModel,
} from '../../../users/api/users.models';
import { UsersService } from '../../../users/application/users.service';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateUserByAdminCommand {
  constructor(public InputModel: CreateUserInputModel) {}
}

@CommandHandler(CreateUserByAdminCommand)
// implements ICommandHandler<CreateUserByAdminCommand>
export class CreateUserByAdminUseCase {
  constructor(
    private usersService: UsersService,
    private usersRepository: UsersRepository,
  ) {}
  // createUser || execute
  async createUser(InputModel: CreateUserInputModel): Promise<UserViewModel> {
    // console.log('CreateUserByAdminUseCase');
    const { salt, hash } = await this.usersService.generateSaltAndHash(
      InputModel.password,
    );
    // создание умного юзера через репозиторий
    const user = await this.usersRepository.createUserByAdmin(
      InputModel,
      salt,
      hash,
    );
    // сохранение умного юзера через репозиторий
    await this.usersRepository.save(user);
    return user.getViewModel();
  }
}
