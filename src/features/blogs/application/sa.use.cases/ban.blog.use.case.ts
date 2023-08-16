import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class BanBlogCommand {
  constructor(public blogId: string, public banStatus: boolean) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: BanBlogCommand) {
    if (command.banStatus) {
      await this.blogsRepository.banBlog(command.blogId);
    } else {
      await this.blogsRepository.unbanBlog(command.blogId);
    }
  }
}
