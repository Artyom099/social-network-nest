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
import { PostsService } from './posts.service';
import { GetItemsWithPaging } from '../utils/common.models';
import { PostInputModel } from './posts.models';
import { BlogsService } from '../blogs/blogs.service';
import { PostsQueryRepository } from './posts.query.repository';
import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { SortBy, SortDirection } from '../utils/constants';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    private blogService: BlogsService,
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getPosts(@Query() query: GetItemsWithPaging) {
    const pageNumber = query.pageNumber ?? 1;
    const pageSize = query.pageSize ?? 10;
    const sortBy = query.sortBy ?? SortBy.default;
    const sortDirection = query.sortDirection ?? SortDirection.default;
    return this.postsQueryRepository.getSortedPosts(
      Number(pageNumber),
      Number(pageSize),
      sortBy,
      sortDirection,
    );
  }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Body() inputModel: PostInputModel) {
    const foundBLog = await this.blogService.getBlog(inputModel.blogId);
    if (!foundBLog) {
      throw new NotFoundException('blog not found');
    } else {
      return this.postsService.createPost(foundBLog, inputModel);
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPost(@Param('id') postId: string) {
    const foundPost = this.postsService.getPost(postId);
    if (!foundPost) {
      throw new NotFoundException('post not found');
    } else {
      return foundPost;
    }
  }
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') postId: string,
    @Body() inputModel: PostInputModel,
  ) {
    const foundPost = this.postsService.getPost(postId);
    if (!foundPost) {
      throw new NotFoundException('post not found');
    } else {
      return this.postsService.updatePost(postId, inputModel);
    }
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') postId: string) {
    const foundPost = this.postsService.getPost(postId);
    if (!foundPost) {
      throw new NotFoundException('post not found');
    } else {
      return this.postsService.deletePost(postId);
    }
  }

  @Get(':id/comments')
  @HttpCode(HttpStatus.OK)
  async getCommentsCurrentPost(
    @Param('id') postId: string,
    @Query() query: GetItemsWithPaging,
  ) {
    const foundPost = this.postsService.getPost(postId);
    if (!foundPost) {
      throw new NotFoundException('post not found');
    } else {
      const pageNumber = query.pageNumber ?? 1;
      const pageSize = query.pageSize ?? 10;
      const sortBy = query.sortBy ?? SortBy.default;
      const sortDirection = query.sortDirection ?? SortDirection.default;
      return this.commentsQueryRepository.getCommentsCurrentPost(
        postId,
        Number(pageNumber),
        Number(pageSize),
        sortBy,
        sortDirection,
      );
    }
  }
}
