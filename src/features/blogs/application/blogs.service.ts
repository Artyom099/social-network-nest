import { Injectable } from '@nestjs/common';
import { BlogInputModel, BlogViewModel } from '../api/blogs.models';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { Blog } from '../blogs.schema';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';

@Injectable()
export class BlogsService {
  constructor(
    private blogsRepository: BlogsRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async createBlog(
    InputModel: BlogInputModel,
    userId: string,
  ): Promise<BlogViewModel | null> {
    const user = await this.usersQueryRepository.getUserById(userId);
    if (!user) return null;
    const createdBlog = Blog.create(InputModel, user);
    return this.blogsRepository.createBlog(createdBlog);
  }

  async updateBlog(blogId: string, InputModel: BlogInputModel) {
    return this.blogsRepository.updateBlog(blogId, InputModel);
  }
  async deleteBlog(blogId: string) {
    return this.blogsRepository.deleteBlog(blogId);
  }
}
