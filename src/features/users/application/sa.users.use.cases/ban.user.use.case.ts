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
    const user = await this.usersRepository.getUserDocumentById(command.userId);
    if (!user) return null;

    user.banUser(command.inputModel.banReason);
    await this.usersRepository.save(user);
  }
}
