import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';

export class UnbanUserCommand {
  constructor(
    private userId: string,
    private banStatus: boolean,
    private banReason: string,
  ) {}
}

@CommandHandler(UnbanUserCommand)
//implements ICommandHandler<UnbanUserCommand>
export class UnbanUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}
  // banUser || execute
  async unbanUser(userId: string) {
    const user = await this.usersQueryRepository.getUserById2(userId);
    if (!user) return null;

    user.unbanUser();
    await this.usersRepository.save(user);
  }
}
