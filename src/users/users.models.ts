import { SortBy, SortDirection } from '../utils/constants';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class CreateUserInputModel {
  @IsNotEmpty()
  @Length(3, 10)
  login: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @Length(6, 20)
  password: string;
}
export type UserViewModel = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};
export type GetUsersWithPagingAndSearch = {
  sortBy: SortBy;
  sortDirection: SortDirection;
  pageNumber: number;
  pageSize: number;
  searchLoginTerm: string;
  searchEmailTerm: string;
};
