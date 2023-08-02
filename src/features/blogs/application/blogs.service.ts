import { Injectable } from '@nestjs/common';
import { BlogInputModel, BlogViewModel } from '../api/blogs.models';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { Blog } from '../blogs.schema';

@Injectable()
export class BlogsService {
  constructor(protected blogsRepository: BlogsRepository) {}

  async createBlog(InputModel: BlogInputModel): Promise<BlogViewModel> {
    const createdBlog = Blog.create(InputModel);
    return this.blogsRepository.createBlog(createdBlog);
  }

  async updateBlog(blogId: string, InputModel: BlogInputModel) {
    return this.blogsRepository.updateBlog(blogId, InputModel);
  }
  async deleteBlog(blogId: string) {
    return this.blogsRepository.deleteBlog(blogId);
  }
}
