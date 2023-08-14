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
import { CommandBus } from '@nestjs/cqrs';
import { UsersPaginationInput } from '../../../../infrastructure/utils/common.models';
import { UsersQueryRepository } from '../../infrastructure/users.query.repository';
import { BanUserCurrentBlogInputModel } from '../models/ban.user.current.blog.input.model';
import { BanUserForCurrentBlogCommand } from '../../application/blogger.users.use.cases/ban.user.for.current.blog.use.case';
import { BearerAuthGuard } from '../../../../infrastructure/guards/bearer-auth.guard';

@Controller('blogger/users')
@UseGuards(BearerAuthGuard)
export class BloggerUsersController {
  constructor(
    private commandBus: CommandBus,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get('blog/:id')
  @HttpCode(HttpStatus.OK)
  async getBannedUsers(
    @Param('id') blogId: string,
    @Query() query: UsersPaginationInput,
  ) {
    return this.usersQueryRepository.getBannedUsersCurrentBlog(blogId, query);
  }

  @Put(':id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateUserBanStatus(
    @Param('id') userId: string,
    @Body() inputModel: BanUserCurrentBlogInputModel,
  ) {
    const user = await this.usersQueryRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundException();
    } else {
      return this.commandBus.execute(
        new BanUserForCurrentBlogCommand(userId, inputModel),
      );
    }
  }
}
