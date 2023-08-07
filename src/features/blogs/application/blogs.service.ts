import { Injectable } from '@nestjs/common';
import { BlogInputModel } from '../api/blogs.models';
import { BlogsRepository } from '../infrastructure/blogs.repository';

@Injectable()
export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {}

  async updateBlog(blogId: string, InputModel: BlogInputModel) {
    return this.blogsRepository.updateBlog(blogId, InputModel);
  }
  async deleteBlog(blogId: string) {
    return this.blogsRepository.deleteBlog(blogId);
  }
}
