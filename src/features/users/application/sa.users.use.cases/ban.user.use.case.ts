import { UsersRepository } from '../../infrastructure/users.repository';
import { UsersQueryRepository } from '../../infrastructure/users.query.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserInputModel } from '../../api/users.models';

export class BanUserCommand {
  constructor(public userId: string, public inputModel: BanUserInputModel) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: BanUserCommand) {
    const user = await this.usersQueryRepository.getUserById2(command.userId);
    if (!user) return null;

    user.banUser(command.inputModel.banReason);
    await this.usersRepository.save(user);
  }
}
