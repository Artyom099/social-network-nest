import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { BlogInputModel } from '../../api/models/blog.input.model';

export class UpdateBlogCommand {
  constructor(public blogId: string, public inputModel: BlogInputModel) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand) {
    const { blogId, inputModel } = command;

    return this.blogsRepository.updateBlog(blogId, inputModel);
  }
}
