import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';

import { BindBlogUseCase } from '../application/sa.use.cases/bind.blog.use.case';
import { BasicAuthGuard } from '../../../infrastructure/guards/basic-auth.guard';
import { BlogsPaginationInput } from '../../../infrastructure/utils/common.models';

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
export class SABlogsController {
  constructor(
    private bindBlogUseCase: BindBlogUseCase,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getBlogs(@Query() query: BlogsPaginationInput) {
    return this.blogsQueryRepository.getSortedBlogsSA(query);
  }

  @Put(':id/bind-with-user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async bindBlogWithUser(
    @Param('id') blogId: string,
    @Param('userId') userId: string,
  ) {
    const blog = await this.blogsQueryRepository.getBlogSA(blogId);
    if (!blog || blog.blogOwnerInfo) {
      throw new NotFoundException('blog not found');
    } else {
      return this.bindBlogUseCase.bindBlog(blogId, userId);
    }
  }
}
