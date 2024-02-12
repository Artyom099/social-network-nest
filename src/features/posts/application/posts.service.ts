import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastucture/posts.repository';
import { PostInputModel } from '../api/models/post.input.model';
import { LikeStatus } from '../../../infrastructure/utils/enums';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { UpdatePostLikesModel } from '../api/models/update.post.likes.model';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  async updatePost(postId: string, inputModel: PostInputModel) {
    return this.postsRepository.updatePost(postId, inputModel);
  }

  async deletePost(postId: string) {
    return this.postsRepository.deletePost(postId);
  }

  async updatePostLikes(
    postId: string,
    userId: string,
    likeStatus: LikeStatus,
  ) {
    const user = await this.usersQueryRepository.getUserById(userId);
    if (!user) return null;

    const dto: UpdatePostLikesModel = {
      postId,
      userId,
      newLikeStatus: likeStatus,
      addedAt: new Date(),
      login: user.login,
    };
    return this.postsRepository.updatePostLikes(dto);
  }
}
