import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  CreateBlogInputModel,
  GetBlogsWithPagingAndSearch,
  UpdateBlogInputModel,
} from './blogs.models';
import { BlogsService } from './blogs.service';
import { QueryRepository } from '../query/query.repository';

export class BlogsController {
  constructor(protected blogsService: BlogsService) {}
  @Get()
  async getBlogs(@Query() query: GetBlogsWithPagingAndSearch) {
    return QueryRepository.getSortedBlogs(query);
  }
  @Post()
  async createBlog(@Body() inputModel: CreateBlogInputModel) {
    return this.blogsService.createBlog(inputModel);
  }

  @Get(':id')
  async getBlog(@Param('id') blogId: string) {
    return this.blogsService.getBlog(blogId);
  }
  @Put(':id')
  async updateBlog(
    @Param('id') blogId: string,
    @Body() inputModel: UpdateBlogInputModel,
  ) {
    return this.blogsService.updateBlog(blogId, inputModel);
  }
  @Delete(':id')
  async deleteBlog(@Param('id') blogId: string) {
    return this.blogsService.deleteBlog(blogId);
  }

  @Get(':id/posts')
  async getPostsCurrentBlog(@Param('id') blogId: string) {
    return QueryRepository.getSortedPostsCurrentBlog(blogId);
  }
  @Post(':id/posts')
  async createPostCurrentBlog(
    @Param('id') blogId: string,
    @Body() inputModel: CreateBlogInputModel,
  ) {
    return this.postsService.createPost(blogId, inputModel);
  }
}
