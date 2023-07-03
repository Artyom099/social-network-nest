import { Injectable } from '@nestjs/common';
import { PostInputModel, PostViewModel } from './posts.models';
import { LikeStatus } from '../utils/constants';

@Injectable()
export class PostsRepository {
  async getPost(id: string): Promise<PostViewModel> {
    return {
      id,
      title: 'title',
      shortDescription: 'shortDescription',
      content: 'content',
      blogId: 'blogId',
      blogName: 'bLog.name',
      createdAt: new Date().toISOString(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    };
  }
  async createPost(post: PostViewModel): Promise<PostViewModel> {
    return post;
  }
  async updatePost(id: string, InputModel: PostInputModel) {
    return;
  }
  async deletePost(id: string) {
    return;
  }
}
