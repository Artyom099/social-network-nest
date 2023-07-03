import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { PostInputModel, PostViewModel } from './posts.models';
import { LikeStatus } from '../utils/constants';
import { randomUUID } from 'crypto';
import { BlogViewModel } from '../blogs/blogs.models';

@Injectable()
export class PostsService {
  constructor(protected postsRepository: PostsRepository) {}
  async getPost(postId: string): Promise<PostViewModel> {
    return this.postsRepository.getPost(postId);
  }
  async createPost(
    bLog: BlogViewModel,
    InputModel: PostInputModel,
  ): Promise<PostViewModel> {
    const createdPost = {
      id: randomUUID(),
      title: InputModel.title,
      shortDescription: InputModel.shortDescription,
      content: InputModel.content,
      blogId: InputModel.blogId,
      blogName: bLog.name,
      createdAt: new Date().toISOString(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    };
    return this.postsRepository.createPost(createdPost);
  }
  async updatePost(postId: string, InputModel: PostInputModel) {
    return this.postsRepository.updatePost(postId, InputModel);
  }
  async deletePost(postId: string) {
    return this.postsRepository.deletePost(postId);
  }
}
