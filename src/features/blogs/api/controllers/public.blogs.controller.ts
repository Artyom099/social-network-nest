import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import {
  BlogsPaginationInput,
  DefaultPaginationInput,
} from '../../../../infrastructure/models/pagination.input';
import { CheckUserIdGuard } from '../../../../infrastructure/guards/check-userId.guard';
import { PostsQueryRepository } from '../../../posts/infrastucture/posts.query.repository';

@Controller('blogs')
export class PublicBlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getBlogs(@Query() query: BlogsPaginationInput) {
    return this.blogsQueryRepository.getSortedBlogs(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getBlog(@Param('id') blogId: string) {
    const blog = await this.blogsQueryRepository.getBlog(blogId);

    if (!blog) {
      throw new NotFoundException('blog not found');
    } else {
      return blog;
    }
  }

  @Get(':id/posts')
  @UseGuards(CheckUserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getPostsCurrentBlog(
    @Req() req: any,
    @Param('id') blogId: string,
    @Query() query: DefaultPaginationInput,
  ) {
    const blog = await this.blogsQueryRepository.getBlog(blogId);

    if (!blog) {
      throw new NotFoundException('blog not found');
    } else {
      return this.postsQueryRepository.getSortedPostsCurrentBlog(
        req.userId,
        blogId,
        query,
      );
    }
  }
}
