import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { PostInputModel, PostViewModel } from './posts.models';
import { BlogViewModel } from '../blogs/blogs.models';
import { Post } from './posts.schema';
import { LikeStatus } from '../utils/constants';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected usersRepository: UsersRepository,
  ) {}
  async getPost(postId: string): Promise<PostViewModel | null> {
    return this.postsRepository.getPost(postId);
  }
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
    const user = await this.usersRepository.getUserById(userId);
    const addedAt = new Date();
    return this.postsRepository.updatePostLikes(
      postId,
      userId,
      likeStatus,
      addedAt,
      user!.accountData.login,
    );
  }
}
