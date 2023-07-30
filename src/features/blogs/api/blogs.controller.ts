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
  Req,
  UseGuards,
} from '@nestjs/common';
import { BlogInputModel } from './blogs.models';
import { BlogsService } from '../application/blogs.service';
import {
  GetItemsWithPaging,
  GetItemsWithPagingAndSearch,
} from '../../../infrastructure/utils/common.models';
import { PostsService } from '../../posts/application/posts.service';
import { PostInputModel } from '../../posts/api/posts.models';
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';
import { PostsQueryRepository } from '../../posts/infrastucture/posts.query.repository';
import { SortBy, SortDirection } from '../../../infrastructure/utils/constants';
import { BasicAuthGuard } from '../../../infrastructure/guards/basic-auth.guard';
import { CheckUserIdGuard } from '../../../infrastructure/guards/check-userId.guard';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
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
      Number(pageNumber),
      Number(pageSize),
      sortBy,
      sortDirection,
    );
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() inputModel: BlogInputModel) {
    return this.blogsService.createBlog(inputModel);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getBlog(@Param('id') blogId: string) {
    const foundBlog = await this.blogsQueryRepository.getBlog(blogId);
    if (!foundBlog) {
      throw new NotFoundException('blog not found');
    } else {
      return foundBlog;
    }
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') blogId: string,
    @Body() inputModel: BlogInputModel,
  ) {
    const foundBlog = await this.blogsQueryRepository.getBlog(blogId);
    if (!foundBlog) {
      throw new NotFoundException('blog not found');
    } else {
      return this.blogsService.updateBlog(blogId, inputModel);
    }
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') blogId: string) {
    const foundBlog = await this.blogsQueryRepository.getBlog(blogId);
    if (!foundBlog) {
      throw new NotFoundException('blog not found');
    } else {
      return this.blogsService.deleteBlog(blogId);
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

  @Post(':id/posts')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPostCurrentBlog(
    @Param('id') blogId: string,
    @Body() inputModel: PostInputModel,
  ) {
    const foundBlog = await this.blogsQueryRepository.getBlog(blogId);
    if (!foundBlog) {
      throw new NotFoundException('blog not found');
    } else {
      return this.postsService.createPost(foundBlog, inputModel);
    }
  }
}
