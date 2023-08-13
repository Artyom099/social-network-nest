import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserCurrentBlogInputModel } from '../../api/models/ban.user.current.blog.input.model';
import { UsersRepository } from '../../infrastructure/users.repository';

export class BanUserForCurrentBlogCommand {
  constructor(
    public userId: string,
    public inputModel: BanUserCurrentBlogInputModel,
  ) {}
}

@CommandHandler(BanUserForCurrentBlogCommand)
export class BanUserForCurrentBlogUseCase
  implements ICommandHandler<BanUserForCurrentBlogCommand>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: BanUserForCurrentBlogCommand) {
    const { userId, inputModel } = command;
    const user = await this.usersRepository.getUserDocumentById(userId);
    if (!user) return null;

    const bannedUser = await this.usersRepository.getBannedUserCurrentBlog(
      userId,
      inputModel.blogId,
    );
    if (bannedUser && inputModel.isBanned) {
      bannedUser.banUserForCurrentBlog(user.accountData.login, inputModel);
    }
    if (bannedUser && !inputModel.isBanned) {
      bannedUser.unbanUserForCurrentBlog();
    }

    if (!bannedUser && inputModel.isBanned) {
      const newBannedUser = await this.usersRepository.addUserToBanInBlog(
        userId,
        user.accountData.login,
        inputModel,
      );
      await this.usersRepository.save(newBannedUser);
    } else {
      await this.usersRepository.save(bannedUser);
    }
  }
}
