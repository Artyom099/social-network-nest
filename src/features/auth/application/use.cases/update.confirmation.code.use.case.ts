import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailManager } from '../../../../infrastructure/services/email.manager';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';

export class UpdateConfirmationCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(UpdateConfirmationCodeCommand)
export class UpdateConfirmationCodeUseCase
  implements ICommandHandler<UpdateConfirmationCodeCommand>
{
  constructor(
    private emailManager: EmailManager,
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(
    command: UpdateConfirmationCodeCommand,
  ): Promise<string | null> {
    const user = await this.usersQueryRepository.getUserByLoginOrEmail(
      command.email,
    );
    if (!user) return null;
    //обновили у него ConfirmationCode
    const newCode = user.updateConfirmationCode();
    //записали это обновление в БД
    await this.usersRepository.save(user);

    try {
      // убрал await, чтобы работал rateLimitMiddleware (10 секунд)
      await this.emailManager.sendEmailConfirmationMessage(
        command.email,
        newCode,
      );
    } catch (error) {
      return null;
    }
    return newCode;
  }
}
