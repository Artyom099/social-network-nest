import { UsersService } from '../../../users/application/users.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserInputModel } from '../../../users/api/models/create.user.input.model';
import { UserViewModel } from '../../../users/api/models/user.view.model';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export class RegisterUserCommand {
  constructor(public inputModel: CreateUserInputModel) {}
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
    const { inputModel } = command;

    const { salt, hash } = await this.usersService.generateSaltAndHash(
      inputModel.password,
    );

    // создание умного юзера через репозиторий
    const user = await this.usersRepository.createUserBySelf(
      inputModel,
      salt,
      hash,
    );

    // сохранение умного юзера через репозиторий
    await this.usersRepository.save(user);
    return user.getViewModel();
  }
}
