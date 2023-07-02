import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

type CreateUserInputModel = {
  name: string;
  childrenCount: number;
};
type GetUsersWithPagingAndSearch = {
  sortBy: string;
  sortDirection: string;
  pageNumber: string;
  pageSize: string;
  searchLoginTerm: string;
  searchEmailTerm: string;
};

@Controller('users')
export class UsersController {
  @Get()
  getUsers(@Query() query: GetUsersWithPagingAndSearch) {
    return [
      { id: 1, name: 'Dimych' },
      { id: 2, name: 'Victor' },
    ];
  }
  @Post()
  createUser(@Body() inputModel: CreateUserInputModel) {
    return {
      id: 12,
      name: inputModel.name,
      childrenCount: inputModel.childrenCount,
    };
  }
  @Delete(':id')
  deleteUser(@Param('id') userId: string) {
    return;
  }
}
