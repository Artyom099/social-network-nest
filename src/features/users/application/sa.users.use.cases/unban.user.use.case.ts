import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UsersQueryRepository } from '../../infrastructure/users.query.repository';

export class UnbanUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(UnbanUserCommand)
export class UnbanUserUseCase implements ICommandHandler<UnbanUserCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: UnbanUserCommand) {
    // todo использовать обычный репо
    const user = await this.usersQueryRepository.getUserById2(command.userId);
    if (!user) return null;

    user.unbanUser();
    await this.usersRepository.save(user);
  }
}
