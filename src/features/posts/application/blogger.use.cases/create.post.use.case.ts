import { PostInputModel } from '../../api/models/post.input.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastucture/posts.repository';
import { Post } from '../../posts.schema';
import { SABlogViewModel } from '../../../blogs/api/models/sa.blog.view.model';
import { PostViewModel } from '../../api/models/post.view.model';

export class CreatePostCommand {
  constructor(
    public bLog: SABlogViewModel,
    public inputModel: PostInputModel,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(private postsRepository: PostsRepository) {}

  async execute(command: CreatePostCommand): Promise<PostViewModel> {
    const { bLog, inputModel } = command;
    const createdPost = Post.create(bLog, inputModel);
    return this.postsRepository.createPost(createdPost);
  }
}
