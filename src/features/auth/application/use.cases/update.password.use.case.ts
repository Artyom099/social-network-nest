import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export class UpdatePasswordCommand {
  constructor(public code: string, public password: string) {}
}

@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordUseCase
  implements ICommandHandler<UpdatePasswordCommand>
{
  constructor(
    private authService: AuthService,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: UpdatePasswordCommand) {
    const salt = await bcrypt.genSalt(10);
    const hash = await this.authService.generateHash(command.password, salt);

    const user = await this.usersRepository.getUserDocumentByRecoveryCode(
      command.code,
    );
    if (!user) return null;

    user.updateSaltAndHash(salt, hash);
    await this.usersRepository.save(user);
  }
}
