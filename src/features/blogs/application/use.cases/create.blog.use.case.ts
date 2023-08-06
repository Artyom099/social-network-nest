import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Blog } from '../../blogs.schema';
import { BlogInputModel, BlogViewModel } from '../../api/blogs.models';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';

@Injectable()
export class CreateBlogUseCase {
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
}
