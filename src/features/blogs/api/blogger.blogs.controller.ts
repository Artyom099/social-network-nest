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
import { CreateBlogUseCase } from '../application/use.cases/create.blog.use.case';
import { BearerAuthGuard } from '../../../infrastructure/guards/bearer-auth.guard';

@Controller('blogger/blogs')
@UseGuards(BearerAuthGuard)
export class BloggerBlogsController {
  constructor(
    private blogsService: BlogsService,
    private postsService: PostsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,

    private createBlogUseCase: CreateBlogUseCase,
  ) {}

  // логика блогов блоггера
  @Get()
  @HttpCode(HttpStatus.OK)
  async getBlogs(@Req() req, @Query() query: GetItemsWithPagingAndSearch) {
    const searchNameTerm = query.searchNameTerm ?? null;
    const pageNumber = query.pageNumber ?? 1;
    const pageSize = query.pageSize ?? 10;
    const sortBy = query.sortBy ?? SortBy.default;
    const sortDirection = query.sortDirection ?? SortDirection.default;
    return this.blogsQueryRepository.getSortedBlogsCurrentBlogger(
      req.userId,
      searchNameTerm,
      Number(pageNumber),
      Number(pageSize),
      sortBy,
      sortDirection,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Req() req, @Body() inputModel: BlogInputModel) {
    return this.createBlogUseCase.createBlog(inputModel, req.userId);
  }

  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // async getBlog(@Param('id') blogId: string) {
  //   const foundBlog = await this.blogsQueryRepository.getBlog(blogId);
  //   if (!foundBlog) {
  //     throw new NotFoundException('blog not found');
  //   } else {
  //     return foundBlog;
  //   }
  // }

  @Put(':id')
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') blogId: string) {
    const foundBlog = await this.blogsQueryRepository.getBlog(blogId);
    if (!foundBlog) {
      throw new NotFoundException('blog not found');
    } else {
      return this.blogsService.deleteBlog(blogId);
    }
  }

  //
  // логика постов блоггера

  @Get(':id/posts')
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

  @Put(':id/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') blogId: string,
    @Param('postId') postId: string,
    @Body() inputModel: PostInputModel,
  ) {
    const foundPost = await this.postsQueryRepository.getPost(postId);
    if (!foundPost) {
      throw new NotFoundException('post not found');
    } else {
      return this.postsService.updatePost(postId, inputModel);
    }
  }

  @Delete(':id/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('id') blogId: string,
    @Param('postId') postId: string,
  ) {
    const foundPost = await this.postsQueryRepository.getPost(postId);
    if (!foundPost) {
      throw new NotFoundException('post not found');
    } else {
      return this.postsService.deletePost(postId);
    }
  }
}
