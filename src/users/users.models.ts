import { SortBy, SortDirection } from '../utils/constants';

export type GetUsersWithPagingAndSearch = {
  sortBy: SortBy;
  sortDirection: SortDirection;
  pageNumber: number;
  pageSize: number;
  searchLoginTerm: string;
  searchEmailTerm: string;
};
export type CreateUserInputModel = {
  login: string;
  password: string;
  email: string;
};
export type UserViewModel = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};
