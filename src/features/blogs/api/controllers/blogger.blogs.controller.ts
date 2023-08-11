import {
  Body,
  Controller,
  Delete,
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
import { BlogInputModel } from '../models/blog.input.model';
import { BlogsService } from '../../application/blogs.service';
import {
  BlogsPaginationInput,
  DefaultPaginationInput,
} from '../../../../infrastructure/utils/common.models';
import { PostsService } from '../../../posts/application/posts.service';
import { PostInputModel } from '../../../posts/api/models/post.input.model';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { PostsQueryRepository } from '../../../posts/infrastucture/posts.query.repository';
import { CreateBlogCommand } from '../../application/blogger.use.cases/create.blog.use.case';
import { BearerAuthGuard } from '../../../../infrastructure/guards/bearer-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../../../posts/application/blogger.use.cases/create.post.use.case';
import { UpdateBlogCommand } from '../../application/blogger.use.cases/update.blog.use.case';
import { CommentsQueryRepository } from '../../../comments/infrastructure/comments.query.repository';

@Controller('blogger/blogs')
@UseGuards(BearerAuthGuard)
export class BloggerBlogsController {
  constructor(
    private blogsService: BlogsService,
    private postsService: PostsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,

    private commandBus: CommandBus,
  ) {}

  // логика блогов блоггера
  @Get()
  @HttpCode(HttpStatus.OK)
  async getBlogs(@Req() req, @Query() query: BlogsPaginationInput) {
    return this.blogsQueryRepository.getSortedBlogsCurrentBlogger(
      req.userId,
      query,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Req() req, @Body() inputModel: BlogInputModel) {
    return this.commandBus.execute(
      new CreateBlogCommand(req.userId, inputModel),
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Req() req,
    @Param('id') blogId: string,
    @Body() inputModel: BlogInputModel,
  ) {
    const foundBlog = await this.blogsQueryRepository.getBlogSA(blogId);
    if (!foundBlog) {
      throw new NotFoundException('blog not found');
    }
    if (req.userId !== foundBlog.blogOwnerInfo.userId) {
      throw new ForbiddenException();
    } else {
      return this.commandBus.execute(new UpdateBlogCommand(blogId, inputModel));
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Req() req, @Param('id') blogId: string) {
    const foundBlog = await this.blogsQueryRepository.getBlogSA(blogId);
    if (!foundBlog) throw new NotFoundException('blog not found');

    if (req.userId !== foundBlog.blogOwnerInfo.userId) {
      throw new ForbiddenException();
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
    @Query() query: DefaultPaginationInput,
  ) {
    const foundBlog = await this.blogsQueryRepository.getBlog(blogId);
    if (!foundBlog) {
      throw new NotFoundException('blog not found');
    } else {
      return this.postsQueryRepository.getSortedPostsCurrentBlogForBlogger(
        req.userId,
        blogId,
        query,
      );
    }
  }

  @Post(':id/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostCurrentBlog(
    @Req() req,
    @Param('id') blogId: string,
    @Body() inputModel: PostInputModel,
  ) {
    const foundBlog = await this.blogsQueryRepository.getBlogSA(blogId);
    if (!foundBlog) throw new NotFoundException('blog not found');

    if (req.userId !== foundBlog.blogOwnerInfo.userId) {
      throw new ForbiddenException();
    } else {
      return this.commandBus.execute(
        new CreatePostCommand(foundBlog, inputModel),
      );
    }
  }

  @Put(':id/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Req() req,
    @Param('id') blogId: string,
    @Param('postId') postId: string,
    @Body() inputModel: PostInputModel,
  ) {
    const foundBlog = await this.blogsQueryRepository.getBlogSA(blogId);
    if (!foundBlog) throw new NotFoundException('blog not found');
    if (req.userId !== foundBlog.blogOwnerInfo.userId) {
      throw new ForbiddenException();
    }

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
    @Req() req,
    @Param('id') blogId: string,
    @Param('postId') postId: string,
  ) {
    const foundBlog = await this.blogsQueryRepository.getBlogSA(blogId);
    if (!foundBlog) throw new NotFoundException('blog not found');
    if (req.userId !== foundBlog.blogOwnerInfo.userId) {
      throw new ForbiddenException();
    }

    const foundPost = await this.postsQueryRepository.getPost(postId);
    if (!foundPost) {
      throw new NotFoundException('post not found');
    } else {
      return this.postsService.deletePost(postId);
    }
  }

  //
  // логика комментов блоггера под своими постами

  @Get('comments')
  @HttpCode(HttpStatus.OK)
  async getCommentsCurrentBlog(
    @Req() req,
    @Query() query: DefaultPaginationInput,
  ) {
    return this.commentsQueryRepository.getCommentsCurrentBlogger(
      req.userId,
      query,
    );
  }
}
