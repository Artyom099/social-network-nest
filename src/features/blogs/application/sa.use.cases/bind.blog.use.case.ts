import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';

@Injectable()
export class BindBlogUseCase {
  constructor(
    private blogsRepository: BlogsRepository,
    private userQueryRepository: UsersQueryRepository,
  ) {}

  async bindBlog(blogId: string, userId: string) {
    const user = await this.userQueryRepository.getUserById(userId);
    if (!user) return null;
    await this.blogsRepository.updateBlogsUser(blogId, userId, user.login);
  }
}
