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
    const user = await this.usersRepository.getUserDocumentById(command.userId);
    if (!user) return null;

    if (command.inputModel.isBanned) {
      user.banUserForCurrentBlog(command.inputModel);
    } else {
      user.unbanUserForCurrentBlog(command.inputModel);
    }
    await this.usersRepository.save(user);
  }
}
