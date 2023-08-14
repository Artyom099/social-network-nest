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
import { UsersQueryRepository } from '../../infrastructure/users.query.repository';
import { BasicAuthGuard } from '../../../../infrastructure/guards/basic-auth.guard';
import { CreateUserByAdminCommand } from '../../application/sa.users.use.cases/create.user.use.case';
import { BanUserCommand } from '../../application/sa.users.use.cases/ban.user.use.case';
import { CommandBus } from '@nestjs/cqrs';
import { UnbanUserCommand } from '../../application/sa.users.use.cases/unban.user.use.case';
import { DevicesService } from '../../../devices/application/devices.service';
import { UsersPaginationInput } from '../../../../infrastructure/utils/common.models';
import { DeleteUserCommand } from '../../application/sa.users.use.cases/delete.user.use.case';
import { BanUserInputModel } from '../models/ban.user.input.model';
import { CreateUserInputModel } from '../models/create.user.input.model';
import { UsersRepository } from '../../infrastructure/users.repository';

@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class SaUsersController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private devicesService: DevicesService,
    private usersRepository: UsersRepository,

    private commandBus: CommandBus,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUsers(@Query() query: UsersPaginationInput) {
    return this.usersQueryRepository.getSortedUsersToSA(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() inputModel: CreateUserInputModel) {
    return this.commandBus.execute(new CreateUserByAdminCommand(inputModel));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') userId: string) {
    const user = await this.usersQueryRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    } else {
      return this.commandBus.execute(new DeleteUserCommand(userId));
    }
  }

  @Put(':id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  async banUser(
    @Param('id') userId: string,
    @Body() inputModel: BanUserInputModel,
  ) {
    const foundUser = await this.usersRepository.getUserDocumentById(userId);
    if (!foundUser) throw new NotFoundException('User not found');

    if (inputModel.isBanned) {
      await this.commandBus.execute(new BanUserCommand(userId, inputModel));
      await this.devicesService.deleteAllSessions(userId);
    } else {
      await this.commandBus.execute(new UnbanUserCommand(userId));
    }
  }
}
