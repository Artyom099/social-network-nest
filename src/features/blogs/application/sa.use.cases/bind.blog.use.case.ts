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
    const { blogId, userId } = command;

    const user = await this.userQueryRepository.getUserById(userId);
    if (!user) return null;

    return this.blogsRepository.updateBlogOwner(blogId, userId, user.login);
  }
}
