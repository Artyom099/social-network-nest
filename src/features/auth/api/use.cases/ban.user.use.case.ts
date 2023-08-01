import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BanUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async banUser(userId: string, banStatus: boolean, banReason: string) {
    const user = await this.usersQueryRepository.getUserById2(userId);
    if (!user) return null;

    user.updateBanStatus(banStatus, banReason);
    await this.usersRepository.save(user);
  }
}
