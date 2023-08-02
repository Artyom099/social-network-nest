import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Blog } from '../../blogs.schema';
import { BlogInputModel, BlogViewModel } from '../../api/blogs.models';

@Injectable()
export class CreateBlogUseCase {
  constructor(private blogsRepository: BlogsRepository) {}

  async createBlog(InputModel: BlogInputModel): Promise<BlogViewModel> {
    const createdBlog = Blog.create(InputModel);
    return this.blogsRepository.createBlog(createdBlog);
  }
}
