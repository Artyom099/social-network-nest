import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { BannedUsersPaginationInput } from '../../../../infrastructure/utils/common.models';
import { UsersQueryRepository } from '../../infrastructure/users.query.repository';
import { BanUserCurrentBlogInputModel } from '../models/ban.user.current.blog.input.model';
import { BanUserForCurrentBlogCommand } from '../../application/blogger.users.use.cases/ban.user.for.current.blog.use.case';
import { BearerAuthGuard } from '../../../../infrastructure/guards/bearer-auth.guard';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/blogs.query.repository';

@Controller('blogger/users')
@UseGuards(BearerAuthGuard)
export class BloggerUsersController {
  constructor(
    private commandBus: CommandBus,
    private usersQueryRepository: UsersQueryRepository,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Get('blog/:id')
  @HttpCode(HttpStatus.OK)
  async getBannedUsers(
    @Req() req,
    @Param('id') blogId: string,
    @Query() query: BannedUsersPaginationInput,
  ) {
    const blog = await this.blogsQueryRepository.getBlogSA(blogId);
    if (!blog) throw new NotFoundException();

    if (req.userId !== blog.blogOwnerInfo.userId) {
      throw new ForbiddenException();
    } else {
      return this.usersQueryRepository.getBannedUsersCurrentBlog(blogId, query);
    }
  }

  @Put(':id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateUserBanStatus(
    @Req() req,
    @Param('id') userId: string,
    @Body() inputModel: BanUserCurrentBlogInputModel,
  ) {
    const user = await this.usersQueryRepository.getUserById(userId);
    if (!user) throw new NotFoundException();

    const blog = await this.blogsQueryRepository.getBlogSA(inputModel.blogId);
    if (!blog || req.userId !== blog.blogOwnerInfo.userId) {
      throw new ForbiddenException();
    } else {
      return this.commandBus.execute(
        new BanUserForCurrentBlogCommand(userId, inputModel),
      );
    }
  }
}
