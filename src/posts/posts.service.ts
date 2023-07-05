import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { PostInputModel, PostViewModel } from './posts.models';
import { BlogViewModel } from '../blogs/blogs.models';
import { Post } from './posts.schema';

@Injectable()
export class PostsService {
  constructor(protected postsRepository: PostsRepository) {}
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
}
