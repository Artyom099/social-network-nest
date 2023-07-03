export type GetUsersWithPagingAndSearch = {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
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
