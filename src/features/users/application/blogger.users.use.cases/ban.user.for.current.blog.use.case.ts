import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserCurrentBlogInputModel } from '../../api/models/ban.user.current.blog.input.model';
import { UsersRepository } from '../../infrastructure/users.repository';
import { BannedUsersForBlogRepository } from '../../infrastructure/banned.users.for.blog.repository';

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
  constructor(
    private usersRepository: UsersRepository,
    private bannedUsersForBlogRepository: BannedUsersForBlogRepository,
  ) {}

  async execute(command: BanUserForCurrentBlogCommand) {
    const { userId, inputModel } = command;
    const user = await this.usersRepository.getUserDocumentById(userId);
    if (!user) return null;

    const bannedUser =
      await this.bannedUsersForBlogRepository.getBannedUserCurrentBlog(
        userId,
        inputModel.blogId,
      );
    if (!bannedUser && inputModel.isBanned) {
      const newBannedUser =
        await this.bannedUsersForBlogRepository.addUserToBanInBlog(
          userId,
          user.accountData.login,
          inputModel,
        );
      return this.bannedUsersForBlogRepository.save(newBannedUser);
    }
    if (bannedUser && !inputModel.isBanned) {
      await bannedUser.unbanUserForCurrentBlog();
      return this.bannedUsersForBlogRepository.save(bannedUser);
    }
    return;
  }
}
