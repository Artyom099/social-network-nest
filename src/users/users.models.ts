export type CreateUserInputModel = {
  login: string;
  password: string;
  email: string;
};
export type GetUsersWithPagingAndSearch = {
  sortBy: string;
  sortDirection: string;
  pageNumber: string;
  pageSize: string;
  searchLoginTerm: string;
  searchEmailTerm: string;
};
export type UserViewModel = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};
export type PagingViewModel<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T;
};
