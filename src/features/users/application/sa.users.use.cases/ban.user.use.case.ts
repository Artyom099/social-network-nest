import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserInputModel } from '../../api/models/ban.user.input.model';
import { UsersRepository } from '../../infrastructure/users.repository';

export class BanUserCommand {
  constructor(public userId: string, public inputModel: BanUserInputModel) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: BanUserCommand) {
    const { userId, inputModel } = command;

    const user = await this.usersRepository.getUserDocumentById(userId);
    if (!user) return null;

    user.banUser(inputModel.banReason);
    return this.usersRepository.save(user);
  }
}
