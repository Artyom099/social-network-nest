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
import { CreateUserByAdminUseCase } from '../../auth/application/use.cases/create.user.use.case';
import { BanUserUseCase } from '../../auth/application/use.cases/ban.user.use.case';
import { CommandBus } from '@nestjs/cqrs';
import { UnbanUserUseCase } from '../../auth/application/use.cases/unban.user.use.case';
import { DevicesService } from '../../devices/application/devices.service';

@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,
    private devicesService: DevicesService,

    private commandBus: CommandBus,
    private banUserUseCase: BanUserUseCase,
    private unbanUserUseCase: UnbanUserUseCase,
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
    return this.usersQueryRepository.getSortedUsersToSA(
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
    //inputModel: CreateUserByAdminCommand || inputModel: CreateUserInputModel

    // с этой строкой запускается, но тесты падают с 500 ошибкой
    // return this.commandBus.execute(new CreateUserByAdminCommand(inputModel));

    return this.createUserByAdminUseCase.createUser(inputModel);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') userId: string) {
    const foundUser = await this.usersQueryRepository.getUserById(userId);
    if (!foundUser) {
      throw new NotFoundException('User not found');
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
    const foundUser = await this.usersQueryRepository.getUserById2(userId);
    if (!foundUser) throw new NotFoundException('User not found');

    if (inputModel.isBanned) {
      await this.banUserUseCase.banUser(
        userId,
        inputModel.isBanned,
        inputModel.banReason,
      );
      await this.devicesService.deleteAllSessions(userId);
    } else {
      await this.unbanUserUseCase.unbanUser(userId);
    }

    // return this.commandBus.execute(
    //   new BanUserCommand(userId, inputModel.isBanned, inputModel.banReason),
    // );
  }
}
