import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';

import {
  BindBlogCommand,
  BindBlogUseCase,
} from '../application/sa.use.cases/bind.blog.use.case';
import { BasicAuthGuard } from '../../../infrastructure/guards/basic-auth.guard';
import { BlogsPaginationInput } from '../../../infrastructure/utils/common.models';
import { BanBloggerInputModel } from '../../users/api/models/users.models';
import { BanBlogUseCase } from '../application/sa.use.cases/ban.blog.use.case';
import { CommandBus } from '@nestjs/cqrs';

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
export class SABlogsController {
  constructor(
    private bindBlogUseCase: BindBlogUseCase,
    private banBlogUseCase: BanBlogUseCase,
    private blogsQueryRepository: BlogsQueryRepository,

    private commandBus: CommandBus,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getBlogs(@Query() query: BlogsPaginationInput) {
    return this.blogsQueryRepository.getSortedBlogsSA(query);
  }

  @Put(':id/bind-with-user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async bindBlogWithUser(
    @Param('id') blogId: string,
    @Param('userId') userId: string,
  ) {
    const blog = await this.blogsQueryRepository.getBlogSA(blogId);
    if (!blog || blog.blogOwnerInfo) {
      throw new NotFoundException('blog not found');
    } else {
      return this.commandBus.execute(new BindBlogCommand(blogId, userId));
    }
  }

  @Put(':id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  async banBlogger(
    @Param('id') blogId: string,
    @Body() inputModel: BanBloggerInputModel,
  ) {
    const blog = await this.blogsQueryRepository.getBlogSA(blogId);
    if (!blog) {
      throw new NotFoundException('blog not found');
    } else {
      return this.banBlogUseCase.banBlog(blogId, inputModel.isBanned);
    }
  }
}
