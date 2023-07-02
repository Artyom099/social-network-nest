import { Injectable } from '@nestjs/common';
import {
  BlogViewModel,
  CreateBlogInputModel,
  UpdateBlogInputModel,
} from './blogs.models';
import { randomUUID } from 'crypto';

@Injectable()
export class BlogsRepository {
  async getBlog(id: string): Promise<BlogViewModel> {
    return {
      id,
      name: 'name',
      description: 'description',
      websiteUrl: 'websiteUrl',
      createdAt: new Date().toISOString(),
      isMembership: true,
    };
  }
  async createBlog(blog: BlogViewModel): Promise<BlogViewModel> {
    return blog;
  }
  async updateBlog(id: string, InputModel: UpdateBlogInputModel) {
    return;
  }
  async deleteBlog(id: string) {
    return;
  }
}
