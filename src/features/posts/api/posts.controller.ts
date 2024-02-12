import {
  Body,
  Controller,
  ForbiddenException,
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
import { DefaultPaginationInput } from '../../../infrastructure/models/pagination.input';
import { PostsQueryRepository } from '../infrastucture/posts.query.repository';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query.repository';
import { BearerAuthGuard } from '../../../infrastructure/guards/bearer-auth.guard';
import { CommentInputModel } from '../../comments/api/models/comment.input.model';
import { CheckUserIdGuard } from '../../../infrastructure/guards/check-userId.guard';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from '../../comments/application/use.cases/create.comment.use.case';
import { LikeStatusInputModel } from '../../comments/api/models/like.status.input.model';
import { BannedUsersForBlogRepository } from '../../users/infrastructure/banned.users.for.blog.repository';
import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query.repository';
import { CreateCommentModel } from '../../comments/api/models/create.comment.model';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private usersQueryRepository: UsersQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private bannedUsersForBlogRepository: BannedUsersForBlogRepository,

    private commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(CheckUserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getPosts(@Req() req: any, @Query() query: DefaultPaginationInput) {
    return this.postsQueryRepository.getSortedPosts(req.userId, query);
  }

  @Get(':id')
  @UseGuards(CheckUserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getPost(@Req() req: any, @Param('id') postId: string) {
    const post = await this.postsQueryRepository.getPost(postId, req.userId);
    if (!post) throw new NotFoundException('post not found');

    const blog = await this.blogsQueryRepository.getBlogSA(post.blogId);
    if (!blog || blog.banInfo.isBanned)
      throw new NotFoundException('blog not found or banned');

    return post;
  }

  @Get(':id/comments')
  @UseGuards(CheckUserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getCommentsCurrentPost(
    @Req() req: any,
    @Param('id') postId: string,
    @Query() query: DefaultPaginationInput,
  ) {
    const post = await this.postsQueryRepository.getPost(postId);
    if (!post) throw new NotFoundException('post not found');

    return this.commentsQueryRepository.getCommentsCurrentPost(
      req.userId,
      postId,
      query,
    );
  }

  @Post(':id/comments')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCommentCurrentPost(
    @Req() req: any,
    @Param('id') postId: string,
    @Body() body: CommentInputModel,
  ) {
    const post = await this.postsQueryRepository.getPost(postId);
    const user = await this.usersQueryRepository.getUserById(req.userId);
    if (!post || !user) throw new NotFoundException('user or post not found');

    const isUserBannedForBlog =
      await this.bannedUsersForBlogRepository.getBannedUserCurrentBlog(
        user.id,
        post.blogId,
      );
    if (isUserBannedForBlog) throw new ForbiddenException();

    const dto: CreateCommentModel = {
      postId,
      content: body.content,
      userId: user.id,
      userLogin: user.login,
      title: post.title,
      blogId: post.blogId,
      blogName: post.blogName,
    };
    return this.commandBus.execute(new CreateCommentCommand(dto));
  }

  @Put(':id/like-status')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Req() req: any,
    @Param('id') postId: string,
    @Body() body: LikeStatusInputModel,
  ) {
    const post = await this.postsQueryRepository.getPost(postId);
    if (!post) throw new NotFoundException('post not found');

    return this.postsService.updatePostLikes(
      postId,
      req.userId,
      body.likeStatus,
    );
  }
}
