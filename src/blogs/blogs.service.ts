import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import {
  BlogViewModel,
  CreateBlogInputModel,
  UpdateBlogInputModel,
} from './blogs.models';
import { randomUUID } from 'crypto';
import { BlogsRepository } from './blogs.repository';

@Injectable()
export class BlogsService {
  constructor(protected blogsRepository: BlogsRepository) {}
  async getBlog(blogId: string): Promise<BlogViewModel> {
    return await this.blogsRepository.getBlog(blogId);
  }
  async createBlog(InputModel: CreateBlogInputModel): Promise<BlogViewModel> {
    const createdBlog: BlogViewModel = {
      id: randomUUID(),
      name: InputModel.name,
      description: InputModel.description,
      websiteUrl: InputModel.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: true,
    };
    return await this.blogsRepository.createBlog(createdBlog);
  }
  async updateBlog(blogId: string, InputModel: UpdateBlogInputModel) {
    return this.blogsRepository.updateBlog(blogId, InputModel);
  }
  async deleteBlog(blogId: string) {
    return this.blogsRepository.deleteBlog(blogId);
  }
}
