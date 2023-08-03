import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';
import { CommandHandler } from '@nestjs/cqrs';

export class BanUserCommand {
  constructor(
    private userId: string,
    private banStatus: boolean,
    private banReason: string,
  ) {}
}

@CommandHandler(BanUserCommand)
//implements ICommandHandler<BanUserCommand>
export class BanUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}
  // banUser || execute
  async banUser(userId: string, banStatus: boolean, banReason: string) {
    const user = await this.usersQueryRepository.getUserById2(userId);
    if (!user) return null;

    user.banUser(banReason);
    await this.usersRepository.save(user);
  }
}
