import {
  Body,
  Controller,
  Delete,
  Get,
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

@Controller()
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    private postsService: PostsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async getBlogs(@Query() query: GetItemsWithPagingAndSearch) {
    return this.blogsQueryRepository.getSortedBlogs(query);
  }

  @Post()
  async createBlog(@Body() inputModel: BlogInputModel) {
    return this.blogsService.createBlog(inputModel);
  }

  @Get(':id')
  async getBlog(@Param('id') blogId: string) {
    return this.blogsService.getBlog(blogId);
  }
  @Put(':id')
  async updateBlog(
    @Param('id') blogId: string,
    @Body() inputModel: BlogInputModel,
  ) {
    return this.blogsService.updateBlog(blogId, inputModel);
  }
  @Delete(':id')
  async deleteBlog(@Param('id') blogId: string) {
    return this.blogsService.deleteBlog(blogId);
  }

  @Get(':id/posts')
  async getPostsCurrentBlog(
    @Param('id') blogId: string,
    @Query() query: GetItemsWithPaging,
  ) {
    return this.postsQueryRepository.getSortedPostsCurrentBlog(blogId, query);
  }
  @Post(':id/posts')
  async createPostCurrentBlog(
    @Param('id') blogId: string,
    @Body() inputModel: PostInputModel,
  ) {
    const foundBlog = await this.blogsService.getBlog(blogId);
    return this.postsService.createPost(foundBlog, inputModel);
  }
}
