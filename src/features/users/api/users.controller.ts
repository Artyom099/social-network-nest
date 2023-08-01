import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import {
  BanUserInputModel,
  CreateUserInputModel,
  GetUsersWithPagingAndSearch,
} from './users.models';
import { SortBy, SortDirection } from '../../../infrastructure/utils/constants';
import { UsersQueryRepository } from '../infrastructure/users.query.repository';
import { BasicAuthGuard } from '../../../infrastructure/guards/basic-auth.guard';
import { CreateUserByAdminUseCase } from '../../auth/api/use.cases/create.user.use.case';
import { BanUserUseCase } from '../../auth/api/use.cases/ban.user.use.case';

@UseGuards(BasicAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,

    private banUserUseCase: BanUserUseCase,
    private createUserByAdminUseCase: CreateUserByAdminUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUsers(@Query() query: GetUsersWithPagingAndSearch) {
    const searchEmailTerm = query.searchEmailTerm ?? null;
    const searchLoginTerm = query.searchLoginTerm ?? null;
    const pageNumber = query.pageNumber ?? 1;
    const pageSize = query.pageSize ?? 10;
    const sortBy = query.sortBy ?? SortBy.default;
    const sortDirection = query.sortDirection ?? SortDirection.default;
    return this.usersQueryRepository.getSortedUsers(
      searchEmailTerm,
      searchLoginTerm,
      Number(pageNumber),
      Number(pageSize),
      sortBy,
      sortDirection,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() inputModel: CreateUserInputModel) {
    return this.createUserByAdminUseCase.createUser(inputModel);
    // return this.usersService.createUser(inputModel);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') userId: string) {
    const foundUser = await this.usersQueryRepository.getUserById(userId);
    if (!foundUser) {
      throw new NotFoundException('Blog not found');
    } else {
      return this.usersService.deleteUser(userId);
    }
  }

  @Put(':id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  async banUser(
    @Param('id') userId: string,
    @Body() inputModel: BanUserInputModel,
  ) {
    return this.banUserUseCase.banUser(
      userId,
      inputModel.isBanned,
      inputModel.banReason,
    );
  }
}
