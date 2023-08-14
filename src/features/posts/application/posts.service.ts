import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastucture/posts.repository';
import { PostInputModel } from '../api/models/post.input.model';
import { LikeStatus } from '../../../infrastructure/utils/constants';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { UsersRepository } from '../../users/infrastructure/users.repository';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  async updatePost(postId: string, InputModel: PostInputModel) {
    return this.postsRepository.updatePost(postId, InputModel);
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
    const addedAt = new Date();
    return this.postsRepository.updatePostLikes(
      postId,
      userId,
      likeStatus,
      addedAt,
      user.login,
    );
  }
}
