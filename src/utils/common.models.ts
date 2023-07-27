import { SortBy, SortDirection } from './constants';

export type GetItemsWithPaging = {
  sortBy: SortBy;
  sortDirection: SortDirection;
  pageNumber: number;
  pageSize: number;
};
export type GetItemsWithPagingAndSearch = {
  sortBy: SortBy;
  sortDirection: SortDirection;
  pageNumber: number;
  pageSize: number;
  searchNameTerm: string;
};
export type PagingViewModel<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T;
};
