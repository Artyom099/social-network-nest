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
import { BlogsService } from '../../blogs/application/blogs.service';
import { PostsQueryRepository } from '../infrastucture/posts.query.repository';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query.repository';
import { BearerAuthGuard } from '../../../infrastructure/guards/bearer-auth.guard';
import {
  CommentInputModel,
  LikeStatusInputModel,
} from '../../comments/api/comments.models';
import { CommentsService } from '../../comments/application/comments.service';
import { CheckUserIdGuard } from '../../../infrastructure/guards/check-userId.guard';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query.repository';

@Controller('posts')
export class PostsController {
  constructor(
    private blogService: BlogsService,
    private postsService: PostsService,
    private commentsService: CommentsService,
    private postsQueryRepository: PostsQueryRepository,
    private blogsQueryRepository: BlogsQueryRepository,
    private usersQueryRepository: UsersQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
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
    const foundPost = await this.postsQueryRepository.getPost(postId);
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

  // @Post()
  // @UseGuards(BasicAuthGuard)
  // @HttpCode(HttpStatus.CREATED)
  // async createPost(@Body() inputModel: PostInputModelWithBlogId) {
  //   const foundBLog = await this.blogsQueryRepository.getBlog(
  //     inputModel.blogId,
  //   );
  //   if (!foundBLog) {
  //     throw new NotFoundException('blog not found');
  //   } else {
  //     return this.postsService.createPost(foundBLog, inputModel);
  //   }
  // }
  //
  // @Put(':id')
  // @UseGuards(BasicAuthGuard)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async updatePost(
  //   @Param('id') postId: string,
  //   @Body() inputModel: PostInputModelWithBlogId,
  // ) {
  //   const foundPost = await this.postsQueryRepository.getPost(postId);
  //   if (!foundPost) {
  //     throw new NotFoundException('post not found');
  //   } else {
  //     return this.postsService.updatePost(postId, inputModel);
  //   }
  // }
  //
  // @Delete(':id')
  // @UseGuards(BasicAuthGuard)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deletePost(@Param('id') postId: string) {
  //   const foundPost = await this.postsQueryRepository.getPost(postId);
  //   if (!foundPost) {
  //     throw new NotFoundException('post not found');
  //   } else {
  //     return this.postsService.deletePost(postId);
  //   }
  // }
}
