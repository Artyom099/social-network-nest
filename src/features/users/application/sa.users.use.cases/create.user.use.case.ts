import {
  CreateUserInputModel,
  SAUserViewModel,
} from '../../api/models/users.models';
import { UsersService } from '../users.service';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateUserByAdminCommand {
  constructor(public InputModel: CreateUserInputModel) {}
}

@CommandHandler(CreateUserByAdminCommand)
export class CreateUserByAdminUseCase
  implements ICommandHandler<CreateUserByAdminCommand>
{
  constructor(
    private usersService: UsersService,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: CreateUserByAdminCommand): Promise<SAUserViewModel> {
    // здесь нельзя вызывать query репозиторий
    const { InputModel } = command;
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
    return user.getSAViewModel();
  }
}
