import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastucture/posts.repository';
import { PostInputModel, PostViewModel } from '../api/posts.models';
import { BlogViewModel } from '../../blogs/api/blogs.models';
import { Post } from '../posts.schema';
import { LikeStatus } from '../../../infrastructure/utils/constants';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  async createPost(
    bLog: BlogViewModel,
    InputModel: PostInputModel,
  ): Promise<PostViewModel> {
    const createdPost = Post.create(bLog, InputModel);
    return this.postsRepository.createPost(createdPost);
  }
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
