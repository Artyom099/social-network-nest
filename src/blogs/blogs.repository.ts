import { Injectable } from '@nestjs/common';
import { BlogInputModel, BlogViewModel } from './blogs.models';

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
  async updateBlog(id: string, InputModel: BlogInputModel) {
    return;
  }
  async deleteBlog(id: string) {
    return;
  }
}
