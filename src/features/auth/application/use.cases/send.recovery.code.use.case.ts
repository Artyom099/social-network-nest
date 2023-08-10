import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailManager } from '../../../../infrastructure/services/email.manager';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';

export class SendRecoveryCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(SendRecoveryCodeCommand)
export class SendRecoveryCodeUseCase
  implements ICommandHandler<SendRecoveryCodeCommand>
{
  constructor(
    private emailManager: EmailManager,
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: SendRecoveryCodeCommand): Promise<string | null> {
    const user = await this.usersQueryRepository.getUserByLoginOrEmail(
      command.email,
    );
    if (!user) return null;
    const recoveryCode = user.updateRecoveryCode();
    await this.usersRepository.save(user);
    try {
      //await
      await this.emailManager.sendEmailRecoveryCode(
        command.email,
        recoveryCode,
      );
    } catch (e) {
      return null;
    }
    return recoveryCode;
  }
}
