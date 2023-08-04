import { UsersService } from '../../../users/application/users.service';
import {
  CreateUserInputModel,
  UserViewModel,
} from '../../../users/api/users.models';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RegisterUserCommand {
  constructor(public InputModel: CreateUserInputModel) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    private usersService: UsersService,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: RegisterUserCommand): Promise<UserViewModel> {
    const { InputModel } = command;
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
