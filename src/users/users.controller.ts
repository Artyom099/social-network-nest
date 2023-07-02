import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserInputModel,
  GetUsersWithPagingAndSearch,
} from './users.models';
import { SortBy, SortDirection } from '../constants';
import { QueryRepository } from '../query/query.repository';

@Controller('users')
export class UsersController {
  constructor(protected usersService: UsersService) {}
  @Get()
  async getUsers(@Query() query: GetUsersWithPagingAndSearch) {
    const searchEmailTerm = query.searchEmailTerm ?? null;
    const searchLoginTerm = query.searchLoginTerm ?? null;
    const pageNumber = query.pageNumber ?? 1;
    const pageSize = query.pageSize ?? 10;
    const sortBy = query.sortBy ?? SortBy.default;
    const sortDirection = query.sortDirection ?? SortDirection.default;
    return QueryRepository.getSortedUsers(
      searchEmailTerm,
      searchLoginTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    );
  }
  @Post()
  async createUser(@Body() inputModel: CreateUserInputModel) {
    return this.usersService.createUser(inputModel);
  }
  @Delete(':id')
  async deleteUser(@Param('id') userId: string) {
    return this.usersService.deleteUser(userId);
  }
}
