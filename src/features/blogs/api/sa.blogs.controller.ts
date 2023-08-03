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

import { BindBlogUseCase } from '../application/use.cases/bind.blog.use.case';
import { BasicAuthGuard } from '../../../infrastructure/guards/basic-auth.guard';
import { GetItemsWithPagingAndSearch } from '../../../infrastructure/utils/common.models';
import { SortBy, SortDirection } from '../../../infrastructure/utils/constants';

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
export class SABlogsController {
  constructor(
    private bindBlogUseCase: BindBlogUseCase,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getBlogs(@Query() query: GetItemsWithPagingAndSearch) {
    const searchNameTerm = query.searchNameTerm ?? null;
    const pageNumber = query.pageNumber ?? 1;
    const pageSize = query.pageSize ?? 10;
    const sortBy = query.sortBy ?? SortBy.default;
    const sortDirection = query.sortDirection ?? SortDirection.default;
    return this.blogsQueryRepository.getSortedBlogsSA(
      searchNameTerm,
      Number(pageNumber),
      Number(pageSize),
      sortBy,
      sortDirection,
    );
  }

  @Put(':id/bind-with-user/:userId')
  @UseGuards(BasicAuthGuard)
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
