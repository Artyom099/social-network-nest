import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BindBlogUseCase } from '../application/use.cases/bind.blog.use.case';
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';
import {
  GetItemsWithPaging,
  GetItemsWithPagingAndSearch,
} from '../../../infrastructure/utils/common.models';
import { SortBy, SortDirection } from '../../../infrastructure/utils/constants';
import { CheckUserIdGuard } from '../../../infrastructure/guards/check-userId.guard';
import { PostsQueryRepository } from '../../posts/infrastucture/posts.query.repository';

@Controller('/blogs')
export class PublicBlogsController {
  constructor(
    private bindBlogUseCase: BindBlogUseCase,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getBlogs(@Query() query: GetItemsWithPagingAndSearch) {
    const searchNameTerm = query.searchNameTerm ?? null;
    const pageNumber = query.pageNumber ?? 1;
    const pageSize = query.pageSize ?? 10;
    const sortBy = query.sortBy ?? SortBy.default;
    const sortDirection = query.sortDirection ?? SortDirection.default;
    return this.blogsQueryRepository.getSortedBlogs(
      searchNameTerm,
      Number(pageNumber),
      Number(pageSize),
      sortBy,
      sortDirection,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getBlog(@Param('id') blogId: string) {
    const foundBlog = await this.blogsQueryRepository.getBlog(blogId);
    console.log({ 'GET:blogs/:id': foundBlog });
    if (!foundBlog) {
      throw new NotFoundException('blog not found');
    } else {
      return foundBlog;
    }
  }

  @Get(':id/posts')
  @UseGuards(CheckUserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getPostsCurrentBlog(
    @Req() req,
    @Param('id') blogId: string,
    @Query() query: GetItemsWithPaging,
  ) {
    const foundBlog = await this.blogsQueryRepository.getBlog(blogId);
    if (!foundBlog) {
      throw new NotFoundException('blog not found');
    } else {
      const pageNumber = query.pageNumber ?? 1;
      const pageSize = query.pageSize ?? 10;
      const sortBy = query.sortBy ?? SortBy.default;
      const sortDirection = query.sortDirection ?? SortDirection.default;
      return this.postsQueryRepository.getSortedPostsCurrentBlog(
        req.userId,
        blogId,
        Number(pageNumber),
        Number(pageSize),
        sortBy,
        sortDirection,
      );
    }
  }
}
