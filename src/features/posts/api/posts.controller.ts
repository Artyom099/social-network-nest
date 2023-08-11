import {
  Body,
  Controller,
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
import { PostsService } from '../application/posts.service';
import { DefaultPaginationInput } from '../../../infrastructure/utils/common.models';
import { PostsQueryRepository } from '../infrastucture/posts.query.repository';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query.repository';
import { BearerAuthGuard } from '../../../infrastructure/guards/bearer-auth.guard';
import { CommentInputModel } from '../../comments/api/models/comment.input.model';
import { CheckUserIdGuard } from '../../../infrastructure/guards/check-userId.guard';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from '../../comments/application/use.cases/create.comment.use.case';
import { LikeStatusInputModel } from '../../comments/api/models/like.status.input.model';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private usersQueryRepository: UsersQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,

    private commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(CheckUserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getPosts(@Req() req, @Query() query: DefaultPaginationInput) {
    return this.postsQueryRepository.getSortedPosts(req.userId, query);
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

  @Get(':id/comments')
  @UseGuards(CheckUserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getCommentsCurrentPost(
    @Req() req,
    @Param('id') postId: string,
    @Query() query: DefaultPaginationInput,
  ) {
    const foundPost = await this.postsQueryRepository.getPost(postId);
    if (!foundPost) {
      throw new NotFoundException('post not found');
    } else {
      return this.commentsQueryRepository.getCommentsCurrentPost(
        req.userId,
        postId,
        query,
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
    //todo - добавить проверку не забанен ли пользователем в текущем блоге
    const post = await this.postsQueryRepository.getPost(postId);
    const user = await this.usersQueryRepository.getUserById(req.userId);
    if (!post || !user) {
      throw new NotFoundException('user or post not found');
    } else {
      const model = {
        postId,
        content: inputModel.content,
        userId: user.id,
        userLogin: user.login,
        title: post.title,
        blogId: post.blogId,
        blogName: post.blogName,
      };
      return this.commandBus.execute(new CreateCommentCommand(model));
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
    const foundPost = await this.postsQueryRepository.getPost(postId);
    if (!foundPost) {
      throw new NotFoundException('post not found');
    } else {
      return this.postsService.updatePostLikes(
        postId,
        req.userId,
        inputModel.likeStatus,
      );
    }
  }
}
