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
import { PostsService } from './posts.service';
import { GetItemsWithPaging } from '../utils/common.models';
import { PostInputModel } from './posts.models';
import { BlogsService } from '../blogs/blogs.service';
import { PostsQueryRepository } from './posts.query.repository';
import { CommentsQueryRepository } from '../comments/comments.query.repository';

@Controller()
export class PostsController {
  constructor(
    protected postsService: PostsService,
    private blogService: BlogsService,
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}
  @Get()
  async getPosts(@Query() query: GetItemsWithPaging) {
    return this.postsQueryRepository.getSortedPosts(query);
  }
  @Post()
  async createPost(@Body() inputModel: PostInputModel) {
    const foundBLog = await this.blogService.getBlog(inputModel.blogId);
    return this.postsService.createPost(foundBLog, inputModel);
  }

  @Get(':id')
  async getPost(@Param('id') postId: string) {
    return this.postsService.getPost(postId);
  }
  @Put(':id')
  async updatePost(
    @Param('id') postId: string,
    @Body() inputModel: PostInputModel,
  ) {
    return this.postsService.updatePost(postId, inputModel);
  }
  @Delete(':id')
  async deletePost(@Param('id') postId: string) {
    return this.postsService.deletePost(postId);
  }

  @Get(':id/comments')
  async getCommentsCurrentPost(@Param('id') postId: string) {
    return this.commentsQueryRepository.getCommentCurrentPost(postId);
  }
}
