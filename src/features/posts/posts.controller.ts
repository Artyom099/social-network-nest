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
import { PostsService } from './posts.service';
import { GetItemsWithPaging } from '../../utils/common.models';
import { PostInputModelWithBlogId } from './posts.models';
import { BlogsService } from '../blogs/blogs.service';
import { PostsQueryRepository } from './posts.query.repository';
import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { SortBy, SortDirection } from '../../utils/constants';
import { BearerAuthGuard } from '../../infrastructure/guards/bearer-auth.guard';
import {
  CommentInputModel,
  LikeStatusInputModel,
} from '../comments/comments.models';
import { CommentsService } from '../comments/comments.service';
import { CheckUserIdGuard } from '../../infrastructure/guards/check-userId.guard';
import { UsersQueryRepository } from '../users/users.query.repository';
import { BasicAuthGuard } from '../../infrastructure/guards/basic-auth.guard';
import { BlogsQueryRepository } from '../blogs/blogs.query.repository';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private blogService: BlogsService,
    private commentsService: CommentsService,
    private postsQueryRepository: PostsQueryRepository,
    private blogsQueryRepository: BlogsQueryRepository,
    private usersQueryRepository: UsersQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  @UseGuards(CheckUserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getPosts(@Req() req, @Query() query: GetItemsWithPaging) {
    const pageNumber = query.pageNumber ?? 1;
    const pageSize = query.pageSize ?? 10;
    const sortBy = query.sortBy ?? SortBy.default;
    const sortDirection = query.sortDirection ?? SortDirection.default;
    return this.postsQueryRepository.getSortedPosts(
      req.userId,
      Number(pageNumber),
      Number(pageSize),
      sortBy,
      sortDirection,
    );
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Body() inputModel: PostInputModelWithBlogId) {
    const foundBLog = await this.blogsQueryRepository.getBlog(
      inputModel.blogId,
    );
    if (!foundBLog) {
      throw new NotFoundException('blog not found');
    } else {
      return this.postsService.createPost(foundBLog, inputModel);
    }
  }

  @Get(':id')
  @UseGuards(CheckUserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getPost(@Req() req, @Param('id') postId: string) {
    const foundPost = await this.postsQueryRepository.getPost(
      postId,
      req.userId,
    );
    if (!foundPost) {
      throw new NotFoundException('post not found');
    } else {
      return foundPost;
    }
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') postId: string,
    @Body() inputModel: PostInputModelWithBlogId,
  ) {
    const foundPost = await this.postsService.getPost(postId);
    if (!foundPost) {
      throw new NotFoundException('post not found');
    } else {
      return this.postsService.updatePost(postId, inputModel);
    }
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') postId: string) {
    const foundPost = await this.postsService.getPost(postId);
    if (!foundPost) {
      throw new NotFoundException('post not found');
    } else {
      return this.postsService.deletePost(postId);
    }
  }

  @Get(':id/comments')
  @UseGuards(CheckUserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getCommentsCurrentPost(
    @Req() req,
    @Param('id') postId: string,
    @Query() query: GetItemsWithPaging,
  ) {
    const foundPost = await this.postsService.getPost(postId);
    if (!foundPost) {
      throw new NotFoundException('post not found');
    } else {
      const pageNumber = query.pageNumber ?? 1;
      const pageSize = query.pageSize ?? 10;
      const sortBy = query.sortBy ?? SortBy.default;
      const sortDirection = query.sortDirection ?? SortDirection.default;
      return this.commentsQueryRepository.getCommentsCurrentPost(
        req.userId,
        postId,
        Number(pageNumber),
        Number(pageSize),
        sortBy,
        sortDirection,
      );
    }
  }

  @Post(':id/comments')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCommentCurrentPost(
    @Req() req,
    @Param('id') postId: string,
    @Body() inputModel: CommentInputModel,
  ) {
    const foundPost = await this.postsService.getPost(postId);
    if (!foundPost) {
      throw new NotFoundException('post not found');
    }
    const user = await this.usersQueryRepository.getUserById(req.userId);
    if (!user) {
      throw new NotFoundException('user not found');
    } else {
      return this.commentsService.createComment(
        postId,
        inputModel.content,
        user.id,
        user.login,
      );
    }
  }

  @Put(':id/like-status')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Req() req,
    @Param('id') postId: string,
    @Body() inputModel: LikeStatusInputModel,
  ) {
    const foundPost = await this.postsService.getPost(postId);
    if (!foundPost) {
      throw new NotFoundException('post not found');
    } else {
      const userId = req.userId;
      return this.postsService.updatePostLikes(
        postId,
        userId,
        inputModel.likeStatus,
      );
    }
  }
}
