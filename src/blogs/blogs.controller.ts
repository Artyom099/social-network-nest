import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { BlogInputModel } from './blogs.models';
import { BlogsService } from './blogs.service';
import { QueryRepository } from '../query/query.repository';
import {
  GetItemsWithPaging,
  GetItemsWithPagingAndSearch,
} from '../utils/common.models';
import { PostsService } from '../posts/posts.service';
import { PostsRepository } from '../posts/posts.repository';
import { PostInputModel } from '../posts/posts.models';

export class BlogsController {
  constructor(protected blogsService: BlogsService) {}
  @Get()
  async getBlogs(@Query() query: GetItemsWithPagingAndSearch) {
    const queryRepository = new QueryRepository();
    return queryRepository.getSortedBlogs(query);
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
    const queryRepository = new QueryRepository();
    return queryRepository.getSortedPostsCurrentBlog(blogId, query);
  }
  @Post(':id/posts')
  async createPostCurrentBlog(
    @Param('id') blogId: string,
    @Body() inputModel: PostInputModel,
  ) {
    const foundBlog = await this.blogsService.getBlog(blogId);
    const postsService = new PostsService(new PostsRepository());
    return postsService.createPost(foundBlog, inputModel);
  }
}
