import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BlogInputModel } from './blogs.models';
import { BlogsService } from './blogs.service';
import {
  GetItemsWithPaging,
  GetItemsWithPagingAndSearch,
} from '../utils/common.models';
import { PostsService } from '../posts/posts.service';
import { PostInputModel } from '../posts/posts.models';
import { BlogsQueryRepository } from './blogs.query.repository';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { SortBy, SortDirection } from '../utils/constants';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    private postsService: PostsService,
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
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() inputModel: BlogInputModel) {
    return this.blogsService.createBlog(inputModel);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getBlog(@Param('id') blogId: string) {
    const blog = await this.blogsService.getBlog(blogId);
    if (!blog) {
      throw new NotFoundException('blog not found');
    }
  }
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') blogId: string,
    @Body() inputModel: BlogInputModel,
  ) {
    return this.blogsService.updateBlog(blogId, inputModel);
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') blogId: string) {
    return this.blogsService.deleteBlog(blogId);
  }

  @Get(':id/posts')
  @HttpCode(HttpStatus.OK)
  async getPostsCurrentBlog(
    @Param('id') blogId: string,
    @Query() query: GetItemsWithPaging,
  ) {
    const pageNumber = query.pageNumber ?? 1;
    const pageSize = query.pageSize ?? 10;
    const sortBy = query.sortBy ?? SortBy.default;
    const sortDirection = query.sortDirection ?? SortDirection.default;
    return this.postsQueryRepository.getSortedPostsCurrentBlog(
      blogId,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    );
  }
  @Post(':id/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostCurrentBlog(
    @Param('id') blogId: string,
    @Body() inputModel: PostInputModel,
  ) {
    const foundBlog = await this.blogsService.getBlog(blogId);
    if (foundBlog) {
      return this.postsService.createPost(foundBlog, inputModel);
    }
  }
}
