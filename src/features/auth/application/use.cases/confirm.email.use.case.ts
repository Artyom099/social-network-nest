import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export class ConfirmEmailCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: ConfirmEmailCommand): Promise<boolean> {
    const user = await this.usersRepository.getUserDocumentByConfirmationCode(
      command.code,
    );
    if (!user || !user.confirmEmail(command.code)) {
      return false;
    } else {
      await this.usersRepository.save(user);
      await this.usersRepository.getUserDocumentByConfirmationCode(
        command.code,
      );
      return true;
    }
  }
}
