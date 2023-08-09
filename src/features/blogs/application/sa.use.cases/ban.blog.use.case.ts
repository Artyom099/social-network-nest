import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

@Injectable()
export class BanBlogUseCase {
  constructor(private blogsRepository: BlogsRepository) {}

  async banBlog(blogId: string, banStatus: boolean) {
    await this.blogsRepository.banBlog(blogId, banStatus);
  }
}
