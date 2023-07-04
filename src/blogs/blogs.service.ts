import { Injectable } from '@nestjs/common';
import { BlogInputModel, BlogViewModel } from './blogs.models';
import { randomUUID } from 'crypto';
import { BlogsRepository } from './blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './blogs.schema';
import { Model } from 'mongoose';

@Injectable()
export class BlogsService {
  constructor(protected blogsRepository: BlogsRepository) {}
  async getBlog(blogId: string): Promise<BlogViewModel> {
    return this.blogsRepository.getBlog(blogId);
  }
  async createBlog(InputModel: BlogInputModel): Promise<BlogViewModel> {
    const createdBlog: BlogViewModel = {
      id: randomUUID(),
      name: InputModel.name,
      description: InputModel.description,
      websiteUrl: InputModel.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: true,
    };
    return this.blogsRepository.createBlog(createdBlog);
  }
  async updateBlog(blogId: string, InputModel: BlogInputModel) {
    return this.blogsRepository.updateBlog(blogId, InputModel);
  }
  async deleteBlog(blogId: string) {
    return this.blogsRepository.deleteBlog(blogId);
  }
}
