import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Blog } from '../../blogs.schema';
import { BlogInputModel } from '../../api/models/blog.input.model';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogViewModel } from '../../api/models/blog.view.model';

export class CreateBlogCommand {
  constructor(public userId: string, public inputModel: BlogInputModel) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    private blogsRepository: BlogsRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: CreateBlogCommand): Promise<BlogViewModel | null> {
    const { userId, inputModel } = command;
    const user = await this.usersQueryRepository.getUserById(userId);
    if (!user) return null;

    const createdBlog = Blog.create(inputModel, user);
    return this.blogsRepository.createBlog(createdBlog);
  }
}
