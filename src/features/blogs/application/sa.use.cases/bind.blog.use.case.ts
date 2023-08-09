import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class BindBlogCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BindBlogCommand)
export class BindBlogUseCase implements ICommandHandler<BindBlogCommand> {
  constructor(
    private blogsRepository: BlogsRepository,
    private userQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: BindBlogCommand) {
    const user = await this.userQueryRepository.getUserById(command.userId);
    if (!user) return null;
    await this.blogsRepository.updateBlogOwner(
      command.blogId,
      command.userId,
      user.login,
    );
  }
}
