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
import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';

import { BindBlogCommand } from '../../application/sa.use.cases/bind.blog.use.case';
import { BasicAuthGuard } from '../../../../infrastructure/guards/basic-auth.guard';
import { BlogsPaginationInput } from '../../../../infrastructure/utils/common.models';
import { BanBlogCommand } from '../../application/sa.use.cases/ban.blog.use.case';
import { CommandBus } from '@nestjs/cqrs';
import { BanBlogInputModel } from '../../../users/api/models/ban.blog.input.model';

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
export class SABlogsController {
  constructor(
    private commandBus: CommandBus,
    private blogsQueryRepository: BlogsQueryRepository,
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
  async updateBlogBanStatus(
    @Param('id') blogId: string,
    @Body() inputModel: BanBlogInputModel,
  ) {
    const blog = await this.blogsQueryRepository.getBlogSA(blogId);
    if (!blog) {
      throw new NotFoundException('blog not found');
    } else {
      return this.commandBus.execute(
        new BanBlogCommand(blogId, inputModel.isBanned),
      );
    }
  }
}
