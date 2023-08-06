import { BlogViewModel } from '../../api/blogs.models';
import { PostInputModel, PostViewModel } from '../../../posts/api/posts.models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../posts/infrastucture/posts.repository';
import { Post } from '../../../posts/posts.schema';

export class CreatePostCommand {
  constructor(public bLog: BlogViewModel, public inputModel: PostInputModel) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(protected postsRepository: PostsRepository) {}

  async execute(command: CreatePostCommand): Promise<PostViewModel> {
    const { bLog, inputModel } = command;
    const createdPost = Post.create(bLog, inputModel);
    return this.postsRepository.createPost(createdPost);
  }
}
