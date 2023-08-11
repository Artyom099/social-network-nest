import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UsersPaginationInput } from '../../../../infrastructure/utils/common.models';
import { UsersQueryRepository } from '../../infrastructure/users.query.repository';

@Controller('blogger/users')
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
  async updateUserBanStatus(@Param('id') blogId: string) {}
}
